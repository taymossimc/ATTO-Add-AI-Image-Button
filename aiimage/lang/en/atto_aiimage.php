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
 * Strings for component 'atto_aiimage', language 'en'.
 *
 * @package    atto_aiimage
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['pluginname'] = 'AI Image Generator';
$string['settings'] = 'AI Image Generator Settings';
$string['apikey'] = 'Stability AI API Key';
$string['apikey_desc'] = 'Your Stability AI API key from https://platform.stability.ai/';
$string['model'] = 'Stability Model';
$string['model_desc'] = 'Select which Stability AI model to use for image generation';
$string['baseurl'] = 'Base URL';
$string['baseurl_desc'] = 'The base URL for the Stability AI API';
$string['timeout'] = 'Timeout';
$string['timeout_desc'] = 'The timeout in seconds for API requests';

$string['dialogtitle'] = 'Generate AI Image';
$string['promptlabel'] = 'Describe the image you want to create';
$string['aspectratiolabel'] = 'Aspect Ratio';
$string['aspectratio_square'] = 'Square';
$string['aspectratio_landscape'] = 'Landscape';
$string['aspectratio_portrait'] = 'Portrait';
$string['generatebutton'] = 'Generate';
$string['cancel'] = 'Cancel';
$string['processing'] = 'Generating image...';
$string['error'] = 'Error';

$string['testconnection'] = 'Test Connection';
$string['testconnectionheading'] = 'Test API Connection';
$string['testconnection_testing'] = 'Testing connection...';
$string['testconnection_success'] = 'Connection successful!';
$string['testconnection_error'] = 'Connection failed';
$string['testconnection_apikey_missing'] = 'API key is required';
$string['test_success_popup'] = 'Successfully connected to Stability AI API.';
$string['test_error_popup'] = 'Failed to connect to Stability AI API. Please check your settings.'; 