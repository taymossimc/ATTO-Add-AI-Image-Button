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
 * Atto AI Magic - Settings
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

// Add JavaScript for test connection button - make sure we load it after page is ready
$PAGE->requires->js_call_amd('atto_aimagic/settings', 'init', array());

$ADMIN->add('editoratto', new admin_category('atto_aimagic', new lang_string('pluginname', 'atto_aimagic')));

$settings = new admin_settingpage('atto_aimagic_settings', new lang_string('settings', 'atto_aimagic'));
if ($ADMIN->fulltree) {
    // API Key setting
    $settings->add(new admin_setting_configpasswordunmask(
        'atto_aimagic/apikey',
        new lang_string('apikey', 'atto_aimagic'),
        new lang_string('apikey_desc', 'atto_aimagic'),
        ''  // Default value
    ));
    
    // Assistant ID setting
    $settings->add(new admin_setting_configtext(
        'atto_aimagic/assistantid',
        new lang_string('assistantid', 'atto_aimagic'),
        new lang_string('assistantid_desc', 'atto_aimagic'),
        ''
    ));
    
    // Base URL setting
    $settings->add(new admin_setting_configtext(
        'atto_aimagic/baseurl',
        new lang_string('baseurl', 'atto_aimagic'),
        new lang_string('baseurl_desc', 'atto_aimagic'),
        'https://api.openai.com'
    ));
    
    // Timeout setting
    $settings->add(new admin_setting_configtext(
        'atto_aimagic/timeout',
        new lang_string('timeout', 'atto_aimagic'),
        new lang_string('timeout_desc', 'atto_aimagic'),
        '30'
    ));
    
    // Add Test Connection button
    $testconnectionhtml = html_writer::start_div('form-item row');
    $testconnectionhtml .= html_writer::start_div('form-label col-sm-3');
    $testconnectionhtml .= html_writer::end_div();
    $testconnectionhtml .= html_writer::start_div('form-setting col-sm-9');
    $testconnectionhtml .= html_writer::link('#', get_string('testconnection', 'atto_aimagic'), 
        array('id' => 'atto_aimagic_test_connection', 'class' => 'btn btn-secondary'));
    $testconnectionhtml .= html_writer::span('', 
        array('id' => 'atto_aimagic_connection_result', 'style' => 'margin-left: 10px;'));
    $testconnectionhtml .= html_writer::div('', 
        array('id' => 'atto_aimagic_connection_details', 'style' => 'margin-top: 10px; display: none;'));
    $testconnectionhtml .= html_writer::end_div();
    $testconnectionhtml .= html_writer::end_div();
    
    $settings->add(new admin_setting_heading('atto_aimagic_testconnection', 
        get_string('testconnectionheading', 'atto_aimagic'), $testconnectionhtml));
}

$ADMIN->add('editoratto', $settings); 