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

$action = required_param('action', PARAM_ALPHA);
$contextid = required_param('contextid', PARAM_INT);
$prompt = required_param('prompt', PARAM_RAW);
$apikey = required_param('apikey', PARAM_RAW);
$agentid = required_param('agentid', PARAM_TEXT);
$baseurl = required_param('baseurl', PARAM_URL);
$timeout = required_param('timeout', PARAM_INT);

// Ensure the user is logged in and has access to this context.
$context = context::instance_by_id($contextid);
require_login();
require_capability('moodle/site:config', $context);
require_sesskey();

$PAGE->set_context($context);

$result = new stdClass();
$result->success = false;
$result->error = '';
$result->content = '';

// Handle the OpenAI API request.
if ($action === 'generate') {
    try {
        // Make a request to the OpenAI Agents API using cURL
        $curl = new curl();
        $curl->setopt(array(
            'CURLOPT_RETURNTRANSFER' => true,
            'CURLOPT_TIMEOUT' => $timeout,
            'CURLOPT_HTTPHEADER' => array(
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apikey,
                'OpenAI-Beta: agents=v1'
            )
        ));
        
        // Build the agents API request
        $requesturl = rtrim($baseurl, '/') . '/v1/agents/' . $agentid . '/runs';
        $requestdata = json_encode(array(
            'input' => $prompt,
            'model' => 'gpt-4'  // You can configure this as needed
        ));
        
        // Make the initial request to create a run
        $response = $curl->post($requesturl, $requestdata);
        $responsedata = json_decode($response);
        
        if (empty($responsedata) || !isset($responsedata->id)) {
            throw new Exception('Failed to create agent run: ' . $response);
        }
        
        $runid = $responsedata->id;
        $status = $responsedata->status;
        
        // Poll for completion (with a timeout)
        $starttime = time();
        $statusurl = rtrim($baseurl, '/') . '/v1/agents/' . $agentid . '/runs/' . $runid;
        
        // Keep checking until the run is completed or timeout is reached
        while ($status !== 'completed' && (time() - $starttime) < $timeout) {
            sleep(1);  // Wait a second before checking again
            
            $statusresponse = $curl->get($statusurl);
            $statusdata = json_decode($statusresponse);
            
            if (empty($statusdata) || !isset($statusdata->status)) {
                throw new Exception('Failed to get run status: ' . $statusresponse);
            }
            
            $status = $statusdata->status;
            
            // If there's a failure or cancellation, break out of the loop
            if ($status === 'failed' || $status === 'cancelled' || $status === 'expired') {
                throw new Exception('Agent run ' . $status . ': ' . json_encode($statusdata));
            }
        }
        
        // Check if we've timed out
        if ($status !== 'completed') {
            throw new Exception('Agent run timed out after ' . $timeout . ' seconds');
        }
        
        // Get the output from the completed run
        $outputurl = rtrim($baseurl, '/') . '/v1/agents/' . $agentid . '/runs/' . $runid . '/output';
        $outputresponse = $curl->get($outputurl);
        $outputdata = json_decode($outputresponse);
        
        if (empty($outputdata) || !isset($outputdata->content)) {
            throw new Exception('Failed to get run output: ' . $outputresponse);
        }
        
        // Success! Return the content
        $result->success = true;
        $result->content = $outputdata->content;
        
    } catch (Exception $e) {
        $result->error = $e->getMessage();
    }
}

echo json_encode($result); 