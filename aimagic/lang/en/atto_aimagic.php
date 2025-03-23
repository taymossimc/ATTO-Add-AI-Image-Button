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
 * Atto AI Magic - English language strings
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['pluginname'] = 'AI Magic';
$string['settings'] = 'AI Magic Settings';
$string['inserttextprompt'] = 'Insert AI-generated content';
$string['dialogtitle'] = 'AI Magic';
$string['promptlabel'] = 'What would you like to create?';
$string['generatebutton'] = 'Generate';
$string['cancel'] = 'Cancel';
$string['processing'] = 'Generating content...';
$string['error'] = 'Error';
$string['useprompt'] = 'Use as prompt';
$string['replacecontent'] = 'Replace selected content';
$string['addcontent'] = 'Add to selected content';
$string['insertionmodelabel'] = 'Insertion Mode';

// Settings strings
$string['apikey'] = 'OpenAI API Key';
$string['apikey_desc'] = 'Your OpenAI API key for authentication';
$string['assistantid'] = 'OpenAI Assistant ID';
$string['assistantid_desc'] = 'The OpenAI Assistant ID to use for generating content';
$string['baseurl'] = 'OpenAI API Base URL';
$string['baseurl_desc'] = 'The base URL for the OpenAI API (change only if using a custom endpoint)';
$string['timeout'] = 'Request Timeout';
$string['timeout_desc'] = 'Maximum time in seconds to wait for the API response';

// Test connection strings
$string['testconnectionheading'] = 'Test Connection';
$string['testconnection'] = 'Test Connection to OpenAI';
$string['testconnection_success'] = 'Connection successful!';
$string['testconnection_error'] = 'Connection failed:';
$string['testconnection_testing'] = 'Testing connection...';
$string['testconnection_assistant_valid'] = 'Assistant ID is valid';
$string['testconnection_assistant_invalid'] = 'Assistant ID is invalid or not found';
$string['testconnection_apikey_missing'] = 'API Key is missing or invalid';
$string['testconnection_assistant_missing'] = 'Assistant ID is missing';
$string['test_success_popup'] = 'Test Successful: You are Connected to OpenAI';
$string['test_error_popup'] = 'Test Failed: Check Keys';

// Privacy
$string['privacy:metadata:atto_aimagic'] = 'The Atto AI Magic plugin does not store any personal data, but does transmit user-entered content to the OpenAI API for processing.';
$string['privacy:metadata:atto_aimagic:prompt'] = 'The text prompt entered by the user is sent to the OpenAI API for content generation.';
$string['privacy:metadata:atto_aimagic:selection'] = 'If text is selected when using AI Magic, this selection is sent to the OpenAI API for context.';
$string['privacy:metadata:atto_aimagic:userid'] = 'Your user ID is not sent to the external API but is logged in Moodle\'s system logs when using the AI Magic feature.'; 