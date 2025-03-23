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
 * AJAX handler for atto_aimagic.
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);

require_once(__DIR__ . '/../../../../../config.php');
require_once($CFG->libdir . '/filelib.php');

// Debug log function
function aimagic_log($message, $data = null) {
    error_log('AIMAGIC AJAX: ' . $message . ($data !== null ? ' ' . json_encode($data) : ''));
}

aimagic_log('AJAX handler starting');

$action = required_param('action', PARAM_ALPHA);
$contextid = optional_param('contextid', 0, PARAM_INT);
$prompt = required_param('prompt', PARAM_RAW);
$apikey = required_param('apikey', PARAM_RAW);
$assistantid = required_param('assistantid', PARAM_TEXT); // Changed from 'agentid' to 'assistantid'
$baseurl = required_param('baseurl', PARAM_URL);
$timeout = required_param('timeout', PARAM_INT);

aimagic_log('Parameters received', [
    'action' => $action,
    'contextid' => $contextid,
    'promptLength' => strlen($prompt),
    'apiKeyLength' => strlen($apikey),
    'assistantIdLength' => strlen($assistantid), // Renamed for clarity
    'baseurl' => $baseurl,
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
        aimagic_log('Invalid context ID, falling back to system context', [
            'contextid' => $contextid, 
            'error' => $e->getMessage()
        ]);
        $context = context_system::instance();
    }
}

// Set the page context
$PAGE->set_context($context);

// Check capability - using a more appropriate capability for text editors
// Users need to be able to use text editors in their context
if (!has_capability('moodle/course:manageactivities', $context) && 
    !has_capability('moodle/course:update', $context) &&
    !has_capability('moodle/site:edit', $context)) {
    
    // Log the capability check failure
    aimagic_log('User does not have required capabilities', [
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

// Handle the OpenAI API request.
if ($action === 'generate') {
    aimagic_log('Starting OpenAI Assistants API request');
    
    try {
        // Validate API key and Assistant ID
        if (empty($apikey) || strlen($apikey) < 10) {
            throw new Exception('API key is empty or invalid');
        }
        
        if (empty($assistantid) || strlen($assistantid) < 5) {
            throw new Exception('Assistant ID is empty or invalid');
        }
        
        aimagic_log('API credentials validated');
        
        // Setup cURL for all requests
        $curl = new curl();
        $curl->setopt(array(
            'CURLOPT_RETURNTRANSFER' => true,
            'CURLOPT_TIMEOUT' => $timeout,
            'CURLOPT_FAILONERROR' => true, // Fail on HTTP errors
            'CURLOPT_HTTPHEADER' => array(
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apikey,
                'OpenAI-Beta: assistants=v2'
            )
        ));
        
        // First validate the API key by checking the API version
        $curlversion = curl_init($baseurl . '/v1/assistants/' . $assistantid);
        
        // STEP 1: Create a thread with the user's prompt
        aimagic_log('Creating thread with user message');
        $threadurl = rtrim($baseurl, '/') . '/v1/threads';
        $threaddata = json_encode(array(
            'messages' => array(
                array(
                    'role' => 'user',
                    'content' => $prompt
                )
            )
        ));
        
        aimagic_log('Thread creation request', [
            'url' => $threadurl,
            'dataLength' => strlen($threaddata)
        ]);
        
        $threadresponse = $curl->post($threadurl, $threaddata);
        
        aimagic_log('Thread creation response', [
            'httpCode' => $curl->info['http_code'],
            'responseLength' => strlen($threadresponse)
        ]);
        
        if ($curl->info['http_code'] !== 200) {
            aimagic_log('Thread creation error', [
                'httpCode' => $curl->info['http_code'],
                'response' => $threadresponse
            ]);
            throw new Exception('Failed to create thread: HTTP code ' . $curl->info['http_code'] . ' - ' . $threadresponse);
        }
        
        $threaddata = json_decode($threadresponse);
        
        if (empty($threaddata) || !isset($threaddata->id)) {
            aimagic_log('Invalid thread response', [
                'response' => $threadresponse
            ]);
            throw new Exception('Invalid thread creation response: ' . $threadresponse);
        }
        
        $threadid = $threaddata->id;
        aimagic_log('Thread created successfully', ['threadId' => $threadid]);
        
        // STEP 2: Create a run using the thread and assistant ID
        aimagic_log('Creating run with assistant');
        $runurl = rtrim($baseurl, '/') . '/v1/threads/' . $threadid . '/runs';
        $rundata = json_encode(array(
            'assistant_id' => $assistantid
        ));
        
        aimagic_log('Run creation request', [
            'url' => $runurl,
            'threadId' => $threadid,
            'assistantId' => $assistantid
        ]);
        
        $runresponse = $curl->post($runurl, $rundata);
        
        aimagic_log('Run creation response', [
            'httpCode' => $curl->info['http_code'],
            'responseLength' => strlen($runresponse)
        ]);
        
        if ($curl->info['http_code'] !== 200) {
            aimagic_log('Run creation error', [
                'httpCode' => $curl->info['http_code'],
                'response' => $runresponse
            ]);
            throw new Exception('Failed to create run: HTTP code ' . $curl->info['http_code'] . ' - ' . $runresponse);
        }
        
        $rundata = json_decode($runresponse);
        
        if (empty($rundata) || !isset($rundata->id)) {
            aimagic_log('Invalid run response', [
                'response' => $runresponse
            ]);
            throw new Exception('Invalid run creation response: ' . $runresponse);
        }
        
        $runid = $rundata->id;
        $status = $rundata->status;
        
        aimagic_log('Run created successfully', [
            'runId' => $runid,
            'status' => $status
        ]);
        
        // STEP 3: Poll for run completion
        $starttime = time();
        $statusurl = rtrim($baseurl, '/') . '/v1/threads/' . $threadid . '/runs/' . $runid;
        
        aimagic_log('Starting run completion polling loop');
        
        // Keep checking until the run is completed or timeout is reached
        while ($status !== 'completed' && (time() - $starttime) < $timeout) {
            sleep(1);  // Wait a second before checking again
            
            aimagic_log('Polling for run status', [
                'runId' => $runid, 
                'threadId' => $threadid,
                'elapsed' => (time() - $starttime)
            ]);
            
            $statusresponse = $curl->get($statusurl);
            
            if ($curl->info['http_code'] !== 200) {
                aimagic_log('Run status check error', [
                    'httpCode' => $curl->info['http_code'],
                    'response' => $statusresponse
                ]);
                throw new Exception('Run status check failed: HTTP code ' . $curl->info['http_code'] . ' - ' . $statusresponse);
            }
            
            $statusdata = json_decode($statusresponse);
            
            if (empty($statusdata) || !isset($statusdata->status)) {
                aimagic_log('Invalid run status response', [
                    'response' => $statusresponse
                ]);
                throw new Exception('Invalid run status response: ' . $statusresponse);
            }
            
            $status = $statusdata->status;
            aimagic_log('Run status updated', ['status' => $status]);
            
            // If there's a failure or cancellation, break out of the loop
            if ($status === 'failed' || $status === 'cancelled' || $status === 'expired') {
                $errorDetails = '';
                if (isset($statusdata->last_error)) {
                    $errorDetails = $statusdata->last_error->message;
                }
                
                aimagic_log('Run ended with error status', [
                    'status' => $status, 
                    'error' => $errorDetails,
                    'details' => $statusdata
                ]);
                throw new Exception('Assistant run ' . $status . ': ' . $errorDetails);
            }
        }
        
        // Check if we've timed out
        if ($status !== 'completed') {
            aimagic_log('Run timed out', [
                'timeout' => $timeout,
                'lastStatus' => $status
            ]);
            throw new Exception('Assistant run timed out after ' . $timeout . ' seconds');
        }
        
        // STEP 4: Retrieve messages from the thread
        aimagic_log('Run completed, retrieving messages');
        $messagesurl = rtrim($baseurl, '/') . '/v1/threads/' . $threadid . '/messages';
        
        aimagic_log('Messages retrieval request', [
            'url' => $messagesurl,
            'threadId' => $threadid
        ]);
        
        $messagesresponse = $curl->get($messagesurl);
        
        if ($curl->info['http_code'] !== 200) {
            aimagic_log('Messages retrieval error', [
                'httpCode' => $curl->info['http_code'],
                'response' => $messagesresponse
            ]);
            throw new Exception('Failed to retrieve messages: HTTP code ' . $curl->info['http_code'] . ' - ' . $messagesresponse);
        }
        
        $messagesdata = json_decode($messagesresponse);
        
        if (empty($messagesdata) || !isset($messagesdata->data) || !is_array($messagesdata->data) || empty($messagesdata->data)) {
            aimagic_log('Invalid messages response', [
                'response' => $messagesresponse
            ]);
            throw new Exception('Invalid messages response: ' . $messagesresponse);
        }
        
        // Get the assistant's response message (first message with role=assistant)
        $assistantMessage = null;
        foreach ($messagesdata->data as $message) {
            if ($message->role === 'assistant') {
                $assistantMessage = $message;
                break;
            }
        }
        
        if (!$assistantMessage) {
            aimagic_log('No assistant message found', [
                'messageCount' => count($messagesdata->data)
            ]);
            throw new Exception('No assistant response found in thread messages');
        }
        
        // Process the content parts to extract text
        $contentText = '';
        if (isset($assistantMessage->content) && is_array($assistantMessage->content)) {
            foreach ($assistantMessage->content as $contentPart) {
                if ($contentPart->type === 'text') {
                    $contentText .= $contentPart->text->value;
                }
            }
        }
        
        if (empty($contentText)) {
            aimagic_log('Empty assistant response content');
            throw new Exception('Assistant response content is empty');
        }
        
        aimagic_log('Successfully retrieved assistant response', [
            'contentLength' => strlen($contentText)
        ]);
        
        // Clean up content to remove potential code block delimiters
        $contentText = preg_replace('/^\s*```(?:html|php|javascript|css)?\s*/i', '', $contentText);
        $contentText = preg_replace('/\s*```\s*$/i', '', $contentText);
        
        aimagic_log('Content cleaned', [
            'contentLengthAfterCleaning' => strlen($contentText)
        ]);
        
        // Success! Return the content
        $result->success = true;
        $result->content = $contentText;
        
    } catch (Exception $e) {
        aimagic_log('Exception caught', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        $result->error = $e->getMessage();
    }
}

aimagic_log('Sending response', [
    'success' => $result->success,
    'hasError' => !empty($result->error),
    'errorLength' => strlen($result->error),
    'contentLength' => strlen($result->content)
]);

echo json_encode($result); 