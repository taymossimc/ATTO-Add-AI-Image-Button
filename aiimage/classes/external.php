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
 * External API for atto_aiimage.
 *
 * @package    atto_aiimage
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/externallib.php');
require_once($CFG->libdir . '/filelib.php');

/**
 * External API functions for Atto AI Image
 */
class atto_aiimage_external extends external_api {

    /**
     * Returns description of test_connection() parameters.
     *
     * @return external_function_parameters
     */
    public static function test_connection_parameters() {
        return new external_function_parameters(array(
            'apikey' => new external_value(PARAM_RAW, 'Stability.ai API key'),
            'baseurl' => new external_value(PARAM_URL, 'Stability.ai API base URL'),
            'model' => new external_value(PARAM_TEXT, 'Stability.ai model to use')
        ));
    }

    /**
     * Test the connection to the Stability.ai API.
     *
     * @param string $apikey The API key to test
     * @param string $baseurl The base URL of the API
     * @param string $model The model to use
     * @return array The result of the test
     */
    public static function test_connection($apikey, $baseurl, $model) {
        global $USER;

        // Validate parameters
        $params = self::validate_parameters(self::test_connection_parameters(),
            array(
                'apikey' => $apikey,
                'baseurl' => $baseurl,
                'model' => $model
            )
        );

        // Security check - must be logged in
        require_login();

        // Debug log
        error_log('AIIMAGE EXTERNAL: Testing Stability.ai API connection');

        // Build the API URL for testing (engines endpoint is a good test)
        $apiurl = rtrim($params['baseurl'], '/') . '/v1/engines/list';

        $curl = new curl();
        $curl->setopt(array(
            'CURLOPT_RETURNTRANSFER' => true,
            'CURLOPT_TIMEOUT' => 30,
            'CURLOPT_SSL_VERIFYPEER' => true,
            'CURLOPT_HTTPHEADER' => array(
                'Content-Type: application/json',
                'Accept: application/json',
                'Authorization: Bearer ' . $params['apikey']
            )
        ));

        $response = $curl->get($apiurl);
        $info = $curl->get_info();
        $httpcode = $info['http_code'];

        error_log('AIIMAGE EXTERNAL: API test response code ' . $httpcode);

        $result = array(
            'success' => false,
            'error' => '',
            'details' => array()
        );

        if ($httpcode == 200) {
            $data = json_decode($response);

            // Check if the response is valid
            if (is_array($data)) {
                $result['success'] = true;
                $result['details']['models'] = array();

                // Extract model names
                foreach ($data as $engine) {
                    if (is_object($engine) && isset($engine->id)) {
                        $result['details']['models'][] = $engine->id;
                    }
                }

                error_log('AIIMAGE EXTERNAL: API test successful');
            } else {
                $result['error'] = 'Invalid response from Stability AI API';
                error_log('AIIMAGE EXTERNAL: API test failed - invalid response format');
            }
        } else {
            // Parse error message from response
            $error = $response;
            $jsonerror = json_decode($response);
            if (is_object($jsonerror) && isset($jsonerror->message)) {
                $error = $jsonerror->message;
            }

            $result['error'] = "Error connecting to Stability AI API: HTTP $httpcode - $error";
            error_log('AIIMAGE EXTERNAL: API test failed - ' . $result['error']);
        }

        return $result;
    }

    /**
     * Returns description of test_connection() result value.
     *
     * @return external_description
     */
    public static function test_connection_returns() {
        return new external_single_structure(array(
            'success' => new external_value(PARAM_BOOL, 'Whether the connection was successful'),
            'error' => new external_value(PARAM_TEXT, 'Error message if connection failed'),
            'details' => new external_single_structure(array(
                'models' => new external_multiple_structure(
                    new external_value(PARAM_TEXT, 'Model ID'),
                    'List of available models',
                    VALUE_OPTIONAL
                )
            ), 'Additional details', VALUE_OPTIONAL)
        ));
    }
} 