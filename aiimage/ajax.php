<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * AJAX handler for atto_aiimage.
 *
 * @package    atto_aiimage
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);

require_once(__DIR__ . '/../../../../../config.php');
require_once($CFG->libdir . '/filelib.php');

// Debug log function
function aiimage_log($message, $data = null) {
    error_log('AIIMAGE AJAX: ' . $message . ($data !== null ? ' ' . json_encode($data) : ''));
}

aiimage_log('AJAX handler starting');

$action = required_param('action', PARAM_ALPHA);
$contextid = optional_param('contextid', 0, PARAM_INT);
$prompt = required_param('prompt', PARAM_RAW);
// Use the provided API key, but if it's empty, get it from the plugin settings
$providedapikey = optional_param('apikey', '', PARAM_RAW);
$baseurl = required_param('baseurl', PARAM_URL);
$timeout = required_param('timeout', PARAM_INT);
$model = required_param('model', PARAM_TEXT);
$aspectratio = optional_param('aspectratio', 'square', PARAM_TEXT);

// Get the API key from the settings if not provided in the request
$apikey = $providedapikey;
if (empty($apikey)) {
    $apikey = get_config('atto_aiimage', 'apikey');
    aiimage_log('Retrieved API key from plugin settings');
}

aiimage_log('Parameters received', [
    'action' => $action,
    'contextid' => $contextid,
    'promptLength' => strlen($prompt),
    'apiKeyProvided' => !empty($providedapikey),
    'apiKeyFromSettings' => empty($providedapikey) && !empty($apikey),
    'apiKeyLength' => strlen($apikey),
    'baseurl' => $baseurl,
    'model' => $model,
    'aspectratio' => $aspectratio,
    'timeout' => $timeout
]);

// Ensure the user is logged in
require_login();
require_sesskey();

// Set a default context if none is provided
if (empty($contextid)) {
    $context = context_system::instance();
} else {
    try {
        $context = context::instance_by_id($contextid);
    } catch (Exception $e) {
        // If the context ID is invalid, fall back to system context
        aiimage_log('Invalid context ID, falling back to system context', [
            'contextid' => $contextid, 
            'error' => $e->getMessage()
        ]);
        $context = context_system::instance();
    }
}

// Set the page context
$PAGE->set_context($context);

// Check capability - using the specific capability for our plugin
if (!has_capability('atto/aiimage:useaiimage', $context)) {
    // Log the capability check failure
    aiimage_log('User does not have required capabilities', [
        'userid' => $USER->id,
        'contextid' => $contextid,
        'context_level' => $context->contextlevel
    ]);
    
    $result = new stdClass();
    $result->success = false;
    $result->error = 'You do not have permission to use this feature.';
    echo json_encode($result);
    die;
}

$result = new stdClass();
$result->success = false;
$result->error = '';
$result->content = '';

// Set the dimensions based on the aspect ratio
$width = 1024;
$height = 1024;
$api_aspect_ratio = '1:1'; // Default API aspect ratio

switch ($aspectratio) {
    case 'landscape':
        $width = 1344;
        $height = 768;
        $api_aspect_ratio = '16:9';
        break;
    case 'portrait':
        $width = 768;
        $height = 1344;
        $api_aspect_ratio = '9:16';
        break;
    case 'square':
    default:
        $width = 1024;
        $height = 1024;
        $api_aspect_ratio = '1:1';
        break;
}

// Handle different actions
if ($action === 'test') {
    aiimage_log('Testing Stability.ai API connection');
    
    // Check if API key is provided
    if (empty($apikey)) {
        $result->error = 'API key is required';
        aiimage_log('API test failed - API key is missing');
        echo json_encode($result);
        die;
    }
    
    // Build the API URL for testing (engines endpoint is a good test)
    $apiurl = rtrim($baseurl, '/') . '/v1/engines/list';
    
    $curl = new curl();
    $curl->setopt(array(
        'CURLOPT_RETURNTRANSFER' => true,
        'CURLOPT_TIMEOUT' => $timeout,
        'CURLOPT_SSL_VERIFYPEER' => true,
        'CURLOPT_HTTPHEADER' => array(
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $apikey
        )
    ));
    
    $response = $curl->get($apiurl);
    $info = $curl->get_info();
    $httpcode = $info['http_code'];
    
    aiimage_log('API test response', ['http_code' => $httpcode]);
    
    if ($httpcode == 200) {
        $data = json_decode($response);
        
        // Check if the response is valid
        if (is_array($data)) {
            $result->success = true;
            $result->details = new stdClass();
            $result->details->models = array();
            
            // Extract model names
            foreach ($data as $engine) {
                if (is_object($engine) && isset($engine->id)) {
                    $result->details->models[] = $engine->id;
                }
            }
            
            aiimage_log('API test successful', ['models' => $result->details->models]);
        } else {
            $result->error = 'Invalid response from Stability AI API';
            aiimage_log('API test failed - invalid response format', ['response' => $response]);
        }
    } else {
        // Parse error message from response
        $error = $response;
        $jsonerror = json_decode($response);
        if (is_object($jsonerror) && isset($jsonerror->message)) {
            $error = $jsonerror->message;
        }
        
        $result->error = "Error connecting to Stability AI API: HTTP $httpcode - $error";
        aiimage_log('API test failed', ['error' => $result->error]);
    }
    
    echo json_encode($result);
    die;
}

if ($action === 'generate') {
    aiimage_log('Generating image with Stability.ai');
    
    // Check if API key is provided
    if (empty($apikey)) {
        $result->error = 'API key is required';
        aiimage_log('Image generation failed - API key is missing');
        echo json_encode($result);
        die;
    }
    
    // Record this image generation in the database
    global $DB, $USER;
    
    $record = new stdClass();
    $record->userid = $USER->id;
    $record->prompt = $prompt;
    $record->timecreated = time();
    
    try {
        $DB->insert_record('atto_aiimage', $record);
    } catch (Exception $e) {
        aiimage_log('Failed to record image generation in database', ['error' => $e->getMessage()]);
        // Continue anyway - this shouldn't stop image generation
    }
    
    // Build the API URL for image generation
    $apiurl = '';
    
    // Check if the model is a newer Stable Image or SD3 model
    if (strpos($model, 'stable-image-') === 0) {
        // Check specific Stable Image model
        if ($model === 'stable-image-core') {
            $apiurl = rtrim($baseurl, '/') . '/v2beta/stable-image/generate/core';
            aiimage_log('Using v2beta Stable Image Core endpoint for model: ' . $model);
        } else if ($model === 'stable-image-ultra') {
            $apiurl = rtrim($baseurl, '/') . '/v2beta/stable-image/generate/ultra';
            aiimage_log('Using v2beta Stable Image Ultra endpoint for model: ' . $model);
        } else {
            // Fallback for any other stable-image models
            $apiurl = rtrim($baseurl, '/') . '/v2beta/stable-image/generate';
            aiimage_log('Using v2beta generic Stable Image endpoint for model: ' . $model);
        }
    } else if (strpos($model, 'stable-diffusion-3') === 0) {
        // Use v2beta endpoint for SD3 models
        $apiurl = rtrim($baseurl, '/') . '/v2beta/stable-image/generate/sd3';
        aiimage_log('Using v2beta SD3 endpoint for model: ' . $model);
    } else {
        // Use the legacy v1 endpoint for older models
        $apiurl = rtrim($baseurl, '/') . '/v1/generation/' . $model . '/text-to-image';
        aiimage_log('Using v1 legacy endpoint for model: ' . $model);
    }
    
    // Set up the API request payload
    $payload = array(
        'text_prompts' => array(
            array(
                'text' => $prompt,
                'weight' => 1
            )
        ),
        'height' => $height,
        'width' => $width,
        'samples' => 1,
        'cfg_scale' => 7,
        'steps' => 30,
    );
    
    // For newer models, adjust the payload structure if needed
    if (strpos($model, 'stable-image-') === 0 || strpos($model, 'stable-diffusion-3') === 0) {
        // Add model specification for v2beta endpoints
        $payload['model'] = $model;
        
        // Adjust any other parameters that might be different in v2beta API
        if (isset($payload['steps'])) {
            $payload['steps'] = min($payload['steps'], 50); // Ensure steps is within allowed range for v2beta
        }
    }
    
    $curl = new curl();
    
    // Set up different request formats based on the API version
    if (strpos($model, 'stable-image-') === 0 || strpos($model, 'stable-diffusion-3') === 0) {
        // v2beta API requires multipart/form-data format
        aiimage_log('Using multipart/form-data format for v2beta API');
        
        // Map our model names to the expected format for the API
        $api_model = $model;
        if (strpos($model, 'stable-diffusion-3') === 0) {
            // Convert model format: 'stable-diffusion-3.5-medium' -> 'sd3.5-medium'
            $api_model = str_replace('stable-diffusion-', 'sd', $model);
            aiimage_log('Mapped model name for API: ' . $model . ' -> ' . $api_model);
        }
        
        // Convert the nested prompt structure to the format expected by the v2beta API
        $formdata = array(
            'prompt' => $prompt,  // API expects 'prompt' not 'text_prompts[0][text]'
            'height' => $height,
            'width' => $width,
            'samples' => 1,
            'cfg_scale' => 7,
            'steps' => min(30, 50),
            'model' => $api_model,
            'aspect_ratio' => $api_aspect_ratio  // Use the correct API aspect ratio value
        );
        
        aiimage_log('Prepared form data for v2beta API', $formdata);
        
        // For multipart/form-data, we don't set a Content-Type header
        // as curl will set it automatically with the boundary
        $curl->setopt(array(
            'CURLOPT_RETURNTRANSFER' => true,
            'CURLOPT_TIMEOUT' => $timeout,
            'CURLOPT_SSL_VERIFYPEER' => true,
            'CURLOPT_HTTPHEADER' => array(
                'Accept: image/*',  // Request direct image response, not JSON
                'Authorization: Bearer ' . $apikey
            )
        ));
        
        // Use the standard post method with the form data
        $response = $curl->post($apiurl, $formdata);
        
        aiimage_log('Sent multipart request', [
            'url' => $apiurl,
            'formdata_keys' => array_keys($formdata)
        ]);
        
        // For v2beta direct image response (based on Accept: image/* header)
        $info = $curl->get_info();
        $httpcode = $info['http_code'];
        if ($httpcode == 200) {
            // The response is the raw image data, not JSON
            $imagedata = $response;
            aiimage_log('Got raw image data from v2beta API');
        } else {
            // Error responses are still in JSON format
            $result->error = "Error generating image: HTTP $httpcode - $response";
            aiimage_log('Image generation failed', ['error' => $result->error]);
            echo json_encode($result);
            die;
        }
    } else {
        // Legacy v1 API uses JSON format
        aiimage_log('Using JSON format for v1 API');
        $payloadJson = json_encode($payload);
        
        $curl->setopt(array(
            'CURLOPT_RETURNTRANSFER' => true,
            'CURLOPT_TIMEOUT' => $timeout,
            'CURLOPT_SSL_VERIFYPEER' => true,
            'CURLOPT_HTTPHEADER' => array(
                'Content-Type: application/json',
                'Accept: application/json',
                'Authorization: Bearer ' . $apikey
            )
        ));
        
        $response = $curl->post($apiurl, $payloadJson);
    }
    
    $info = $curl->get_info();
    $httpcode = $info['http_code'];
    
    aiimage_log('Image generation response', ['http_code' => $httpcode]);
    
    // For the v2beta API, we've already handled the response above
    // For v1 API, we need to parse the JSON response
    if (!isset($imagedata)) {
        if ($httpcode == 200) {
            $data = json_decode($response);
            
            // Check if the response is valid for v1 API
            if (is_object($data) && isset($data->artifacts) && is_array($data->artifacts)) {
                // v1 API format - handle as before
                $image = $data->artifacts[0];
                
                if (isset($image->base64) && !empty($image->base64)) {
                    // Got the image, now decode base64
                    $imagedata = base64_decode($image->base64);
                    
                    aiimage_log('Got image from v1 API');
                } else {
                    $result->error = 'No image data in the v1 API response';
                    aiimage_log('No image data in v1 response', ['response' => $response]);
                }
            } else {
                $result->error = 'Invalid response format from Stability AI API';
                aiimage_log('Invalid response format - Not a valid v1 format', ['response' => $response]);
            }
        } else {
            // Parse error message from response
            $error = $response;
            $jsonerror = json_decode($response);
            if (is_object($jsonerror) && isset($jsonerror->message)) {
                $error = $jsonerror->message;
            }
            
            $result->error = "Error generating image: HTTP $httpcode - $error";
            aiimage_log('Image generation failed', ['error' => $result->error]);
            echo json_encode($result);
            die;
        }
    }
    
    // Common image processing code for both API versions
    if (isset($imagedata) && $imagedata) {
        // Generate a unique filename
        $filename = 'aiimage_' . time() . '.png';
        
        // Create a temp file to add the watermark
        $tempfile = tempnam(sys_get_temp_dir(), 'atto_aiimage_');
        file_put_contents($tempfile, $imagedata);
        
        // Add the watermark
        $watermarked = add_watermark($tempfile);
        
        if ($watermarked) {
            // Save to Moodle files
            $fs = get_file_storage();
            
            // Prepare file record
            $fileinfo = array(
                'contextid' => $context->id,
                'component' => 'atto_aiimage',
                'filearea' => 'aiimagecontent',
                'itemid' => time(),
                'filepath' => '/',
                'filename' => $filename,
                'timecreated' => time(),
                'timemodified' => time()
            );
            
            // Create the file
            $file = $fs->create_file_from_pathname($fileinfo, $watermarked);
            
            // Clean up temp file
            @unlink($tempfile);
            @unlink($watermarked);
            
            // Create the image URL
            $imageurl = moodle_url::make_pluginfile_url(
                $file->get_contextid(),
                $file->get_component(),
                $file->get_filearea(),
                $file->get_itemid(),
                $file->get_filepath(),
                $file->get_filename(),
                false
            );
            
            // Prepare the HTML for insertion into the editor
            // Replace quotes with single quotes and escape properly for HTML attribute
            $prompt_sanitized = str_replace('"', "'", s($prompt));
            $alt = 'AI generated image of ' . $prompt_sanitized . ' created with Stability.ai';
            $imagehtml = '<img src="' . $imageurl . '" alt="' . $alt . '" class="img-fluid atto-aiimage-generated">';
            
            $result->success = true;
            $result->content = $imagehtml;
            
            aiimage_log('Image successfully generated and stored');
        } else {
            $result->error = 'Failed to add watermark to image';
            aiimage_log('Failed to add watermark');
        }
    }
    
    echo json_encode($result);
    die;
}

/**
 * Add watermark to the generated image
 *
 * @param string $imagepath Path to the input image
 * @return string|false Path to the watermarked image or false on failure
 */
function add_watermark($imagepath) {
    global $CFG;
    
    aiimage_log('Adding watermark to image');
    
    // Load the source image
    $source = imagecreatefrompng($imagepath);
    if (!$source) {
        aiimage_log('Failed to create image from PNG');
        return false;
    }
    
    // Get image dimensions
    $width = imagesx($source);
    $height = imagesy($source);
    
    // Path to the watermark image
    $watermarkpath = __DIR__ . '/assets/watermark.svg';
    
    // Try to load the watermark
    if (!file_exists($watermarkpath)) {
        aiimage_log('Watermark file not found', ['path' => $watermarkpath]);
        // Return the original image if watermark not found
        $outputpath = $imagepath . '_final.png';
        imagepng($source, $outputpath);
        imagedestroy($source);
        return $outputpath;
    }
    
    // Calculate watermark dimensions (10% of image width)
    $watermarkwidth = intval($width * 0.1);
    
    // We need the watermark as PNG for imagecreatefrompng
    $watermarkpng = $imagepath . '_watermark.png';
    
    // Convert SVG to PNG using Imagick if available
    if (class_exists('Imagick')) {
        try {
            $im = new Imagick();
            $im->readImage($watermarkpath);
            $im->setImageFormat('png');
            $im->writeImage($watermarkpng);
            $im->clear();
            $im->destroy();
        } catch (Exception $e) {
            aiimage_log('Failed to convert SVG to PNG with Imagick', ['error' => $e->getMessage()]);
            // Return the original image if conversion fails
            $outputpath = $imagepath . '_final.png';
            imagepng($source, $outputpath);
            imagedestroy($source);
            return $outputpath;
        }
    } else {
        // If Imagick is not available, we'll need to pre-convert the SVG or use a fallback
        aiimage_log('Imagick not available, skipping watermark');
        // Return the original image
        $outputpath = $imagepath . '_final.png';
        imagepng($source, $outputpath);
        imagedestroy($source);
        return $outputpath;
    }
    
    // Load watermark
    $watermark = imagecreatefrompng($watermarkpng);
    if (!$watermark) {
        aiimage_log('Failed to create image from watermark PNG');
        // Return the original image if watermark loading fails
        $outputpath = $imagepath . '_final.png';
        imagepng($source, $outputpath);
        imagedestroy($source);
        @unlink($watermarkpng);
        return $outputpath;
    }
    
    // Resize watermark if needed
    $watermarkheight = imagesy($watermark);
    $watermarkwidth = imagesx($watermark);
    
    $newwatermarkwidth = intval($width * 0.1);
    $newwatermarkheight = intval($watermarkheight * ($newwatermarkwidth / $watermarkwidth));
    
    $resizedwatermark = imagecreatetruecolor($newwatermarkwidth, $newwatermarkheight);
    
    // Preserve transparency
    imagealphablending($resizedwatermark, false);
    imagesavealpha($resizedwatermark, true);
    $transparent = imagecolorallocatealpha($resizedwatermark, 255, 255, 255, 127);
    imagefilledrectangle($resizedwatermark, 0, 0, $newwatermarkwidth, $newwatermarkheight, $transparent);
    
    // Resize watermark
    imagecopyresampled($resizedwatermark, $watermark, 0, 0, 0, 0, 
                      $newwatermarkwidth, $newwatermarkheight, $watermarkwidth, $watermarkheight);
    
    // Position in bottom right corner with 10px padding
    $destx = $width - $newwatermarkwidth - 10;
    $desty = $height - $newwatermarkheight - 10;
    
    // Preserve transparency in the main image
    imagealphablending($source, true);
    imagesavealpha($source, true);
    
    // Copy watermark onto the image
    imagecopy($source, $resizedwatermark, $destx, $desty, 0, 0, $newwatermarkwidth, $newwatermarkheight);
    
    // Save the watermarked image
    $outputpath = $imagepath . '_final.png';
    imagepng($source, $outputpath);
    
    // Clean up resources
    imagedestroy($source);
    imagedestroy($watermark);
    imagedestroy($resizedwatermark);
    @unlink($watermarkpng);
    
    aiimage_log('Watermark added successfully');
    
    return $outputpath;
}

// If we get here, the action is not supported
$result->error = 'Unsupported action';
echo json_encode($result);
die; 