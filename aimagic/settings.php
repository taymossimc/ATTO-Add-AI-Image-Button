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
 * Settings for the atto_aimagic plugin.
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$ADMIN->add('editoratto', new admin_category('atto_aimagic', new lang_string('pluginname', 'atto_aimagic')));

$settings = new admin_settingpage('atto_aimagic_settings', new lang_string('settings', 'atto_aimagic'));
if ($ADMIN->fulltree) {
    // OpenAI API key
    $settings->add(new admin_setting_configpasswordunmask(
        'atto_aimagic/apikey',
        new lang_string('apikey', 'atto_aimagic'),
        new lang_string('apikey_desc', 'atto_aimagic'),
        '')
    );
    
    // Agent ID
    $settings->add(new admin_setting_configtext(
        'atto_aimagic/agentid',
        new lang_string('agentid', 'atto_aimagic'),
        new lang_string('agentid_desc', 'atto_aimagic'),
        '',
        PARAM_TEXT)
    );
    
    // Base URL (for organizations that use a custom endpoint)
    $settings->add(new admin_setting_configtext(
        'atto_aimagic/baseurl',
        new lang_string('baseurl', 'atto_aimagic'),
        new lang_string('baseurl_desc', 'atto_aimagic'),
        'https://api.openai.com',
        PARAM_URL)
    );
    
    // Timeout (in seconds)
    $settings->add(new admin_setting_configtext(
        'atto_aimagic/timeout',
        new lang_string('timeout', 'atto_aimagic'),
        new lang_string('timeout_desc', 'atto_aimagic'),
        '30',
        PARAM_INT)
    );
}

$ADMIN->add('atto_aimagic', $settings); 