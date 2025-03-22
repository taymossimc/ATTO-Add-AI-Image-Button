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
 * Atto AI Magic plugin lib.
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Initialise the js strings required for this module.
 */
function atto_aimagic_strings_for_js() {
    global $PAGE;

    $strings = array(
        'pluginname',
        'inserttextprompt',
        'dialogtitle',
        'promptlabel',
        'generatebutton',
        'cancel',
        'processing',
        'error',
        'useprompt'
    );

    $PAGE->requires->strings_for_js($strings, 'atto_aimagic');
}

/**
 * Return the js params required for this module.
 *
 * @return array of additional params to pass to javascript init function for this module.
 */
function atto_aimagic_params_for_js() {
    global $CFG;
    
    $config = get_config('atto_aimagic');
    
    return array(
        'apikey' => !empty($config->apikey) ? $config->apikey : '',
        'agentid' => !empty($config->agentid) ? $config->agentid : '',
        'baseurl' => !empty($config->baseurl) ? $config->baseurl : 'https://api.openai.com',
        'timeout' => !empty($config->timeout) ? $config->timeout : 30
    );
}

/**
 * Set the order of buttons in the toolbar.
 *
 * @param array $params
 * @return array
 */
function atto_aimagic_setup_toolbar_params(array $params) {
    // The button must be called 'aimagic' (without atto_ prefix) in the toolbar configuration
    $groupaimagic = array('aimagic');

    // Add the aimagic button to the first group (format group).
    if (!isset($params['groups'])) {
        $params['groups'] = array();
    }
    
    if (!isset($params['groups'][0])) {
        $params['groups'][0] = array();
    }
    
    $params['groups'][0] = array_merge($params['groups'][0], $groupaimagic);
    
    return $params;
} 