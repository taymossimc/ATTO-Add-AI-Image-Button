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
 * Atto AI Magic - Test Connection Web Service
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace atto_aimagic\external;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/externallib.php');

use external_api;
use external_function_parameters;
use external_value;
use external_single_structure;

/**
 * Test connection to OpenAI API
 */
class test_connection extends external_api {
    
    /**
     * Parameters definition for execute
     */
    public static function execute_parameters() {
        return new external_function_parameters([
            'apikey' => new external_value(PARAM_TEXT, 'The OpenAI API key'),
            'assistantid' => new external_value(PARAM_TEXT, 'The OpenAI Assistant ID'),
            'baseurl' => new external_value(PARAM_URL, 'The base URL for OpenAI API', VALUE_DEFAULT, 'https://api.openai.com')
        ]);
    }
    
    /**
     * Test the connection to OpenAI API
     *
     * @param string $apikey The OpenAI API key
     * @param string $assistantid The OpenAI Assistant ID
     * @param string $baseurl The base URL for OpenAI API
     * @return array Result containing success status, error message, and details
     */
    public static function execute($apikey, $assistantid, $baseurl) {
        global $CFG;
        
        // Parameter validation
        $params = self::validate_parameters(self::execute_parameters(), [
            'apikey' => $apikey,
            'assistantid' => $assistantid,
            'baseurl' => $baseurl
        ]);
        
        // Security checks
        require_capability('moodle/site:config', \context_system::instance());
        
        // For debugging
        error_log('Atto AI Magic test_connection called with params: ' . json_encode([
            'apikey_length' => strlen($params['apikey']), 
            'assistantid' => $params['assistantid'], 
            'baseurl' => $params['baseurl']
        ]));
        
        $result = [
            'success' => false,
            'error' => '',
            'details' => ''
        ];
        
        // First validate the API key by checking the API version
        $curlversion = curl_init($params['baseurl'] . '/v1/assistants/' . $params['assistantid']);
        curl_setopt($curlversion, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curlversion, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Authorization: Bearer ' . $params['apikey'],
            'OpenAI-Beta: assistants=v2'
        ));
        curl_setopt($curlversion, CURLOPT_TIMEOUT, 10);
        curl_setopt($curlversion, CURLOPT_SSL_VERIFYPEER, true);
        
        // For debugging - log the curl request
        error_log('Atto AI Magic curl request: ' . $params['baseurl'] . '/v1/assistants/' . $params['assistantid']);
        
        $response = curl_exec($curlversion);
        $httpcode = curl_getinfo($curlversion, CURLINFO_HTTP_CODE);
        $error = curl_error($curlversion);
        
        // For debugging - log the curl response
        error_log('Atto AI Magic curl response: HTTP ' . $httpcode . ', Error: ' . $error);
        error_log('Atto AI Magic curl response body: ' . substr($response, 0, 1000));
        
        curl_close($curlversion);
        
        // Add the HTTP code to the details
        $result['details'] = "HTTP Status Code: $httpcode\n\n";
        
        if ($error) {
            $result['error'] = 'cURL Error: ' . $error;
            return $result;
        }

        // Attempt to decode the response
        $responsedata = json_decode($response, true);
        
        if ($httpcode == 200) {
            $result['success'] = true;
            $result['details'] .= "Assistant ID is valid.\n";
            
            // Add some details about the assistant if available
            if (isset($responsedata['id'])) {
                $result['details'] .= "Assistant ID: {$responsedata['id']}\n";
            }
            if (isset($responsedata['name'])) {
                $result['details'] .= "Name: {$responsedata['name']}\n";
            }
            if (isset($responsedata['model'])) {
                $result['details'] .= "Model: {$responsedata['model']}\n";
            }
            if (isset($responsedata['created_at'])) {
                $created = date('Y-m-d H:i:s', $responsedata['created_at']);
                $result['details'] .= "Created: {$created}\n";
            }
            
            return $result;
        } else if ($httpcode == 401) {
            $result['error'] = 'Authentication error: API key is invalid.';
            if (isset($responsedata['error']['message'])) {
                $result['details'] .= "Error details: {$responsedata['error']['message']}\n";
            }
        } else if ($httpcode == 404) {
            $result['error'] = 'Assistant ID not found.';
            if (isset($responsedata['error']['message'])) {
                $result['details'] .= "Error details: {$responsedata['error']['message']}\n";
            }
        } else {
            $result['error'] = 'Unexpected error occurred (HTTP ' . $httpcode . ')';
            if (isset($responsedata['error']['message'])) {
                $result['details'] .= "Error details: {$responsedata['error']['message']}\n";
            }
        }
        
        return $result;
    }
    
    /**
     * Returns description of execute result value
     */
    public static function execute_returns() {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Whether the test was successful'),
            'error' => new external_value(PARAM_TEXT, 'Error message if not successful'),
            'details' => new external_value(PARAM_TEXT, 'Additional details from the test')
        ]);
    }
} 