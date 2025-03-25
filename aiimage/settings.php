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
 * Atto AI Image - Settings
 *
 * @package    atto_aiimage
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

// Add JavaScript for test connection button - make sure we load it after page is ready
$PAGE->requires->js_call_amd('atto_aiimage/settings', 'init', array());

// Create settings page - use unique ID to avoid conflicts
$settings = new admin_settingpage('atto_aiimage_settings', get_string('pluginname', 'atto_aiimage'));

if ($ADMIN->fulltree) {
    // API Key setting
    $settings->add(new admin_setting_configpasswordunmask(
        'atto_aiimage/apikey',
        new lang_string('apikey', 'atto_aiimage'),
        new lang_string('apikey_desc', 'atto_aiimage'),
        ''  // Default value
    ));
    
    // Available Stability.ai models
    $models = array(
        'stable-image-ultra' => 'Stable Image Ultra',
        'stable-image-core' => 'Stable Image Core',
        'stable-diffusion-3.5-large' => 'Stable Diffusion 3.5 Large',
        'stable-diffusion-3.5-medium' => 'Stable Diffusion 3.5 Medium',
        'stable-diffusion-3.5-large-turbo' => 'Stable Diffusion 3.5 Large Turbo',
        'stable-diffusion-3-medium' => 'Stable Diffusion 3 Medium',
        'stable-diffusion-xl-1024-v1-0' => 'Stable Diffusion XL 1.0',
        'stable-diffusion-v1-6' => 'Stable Diffusion 1.6',
        'sdxl-turbo' => 'SDXL Turbo',
        'sd-turbo' => 'SD Turbo'
    );
    
    // Model selection setting
    $settings->add(new admin_setting_configselect(
        'atto_aiimage/model',
        new lang_string('model', 'atto_aiimage'),
        new lang_string('model_desc', 'atto_aiimage'),
        'stable-diffusion-3.5-medium',
        $models
    ));
    
    // Base URL setting
    $settings->add(new admin_setting_configtext(
        'atto_aiimage/baseurl',
        new lang_string('baseurl', 'atto_aiimage'),
        new lang_string('baseurl_desc', 'atto_aiimage'),
        'https://api.stability.ai'
    ));
    
    // Timeout setting
    $settings->add(new admin_setting_configtext(
        'atto_aiimage/timeout',
        new lang_string('timeout', 'atto_aiimage'),
        new lang_string('timeout_desc', 'atto_aiimage'),
        '30'
    ));
    
    // Add Test Connection button
    $testconnectionhtml = html_writer::start_div('form-item row');
    $testconnectionhtml .= html_writer::start_div('form-label col-sm-3');
    $testconnectionhtml .= html_writer::end_div();
    $testconnectionhtml .= html_writer::start_div('form-setting col-sm-9');
    $testconnectionhtml .= html_writer::link('#', get_string('testconnection', 'atto_aiimage'), 
        array('id' => 'atto_aiimage_test_connection', 'class' => 'btn btn-secondary'));
    $testconnectionhtml .= html_writer::span('', 
        array('id' => 'atto_aiimage_connection_result', 'style' => 'margin-left: 10px;'));
    $testconnectionhtml .= html_writer::div('', 
        array('id' => 'atto_aiimage_connection_details', 'style' => 'margin-top: 10px; display: none;'));
    $testconnectionhtml .= html_writer::end_div();
    $testconnectionhtml .= html_writer::end_div();
    
    $settings->add(new admin_setting_heading('atto_aiimage_testconnection', 
        get_string('testconnectionheading', 'atto_aiimage'), $testconnectionhtml));
}

// Add settings page to editor atto category
$ADMIN->add('editoratto', $settings);

// Prevent duplicate settings when core_admin searches for module settings
unset($settings); 