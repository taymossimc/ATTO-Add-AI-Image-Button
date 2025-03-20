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
 * Atto template plugin lib.
 *
 * @package    atto_template
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Initialise the js strings required for this module.
 */
function atto_template_strings_for_js() {
    global $PAGE;

    $strings = array(
        'pluginname',
        'insertemplate',
        'dialogtitle',
        'tilestemplate',
        'cancel',
        'template'
    );

    $PAGE->requires->strings_for_js($strings, 'atto_template');
}

/**
 * Return the js params required for this module.
 *
 * @return array of additional params to pass to javascript init function for this module.
 */
function atto_template_params_for_js() {
    return array();
}

/**
 * Set the order of buttons in the toolbar.
 *
 * @param array $params
 * @return array
 */
function atto_template_setup_toolbar_params(array $params) {
    $grouptemplate = array('template');

    // Add the template button to the first group (format group).
    if (!isset($params['groups'])) {
        $params['groups'] = array();
    }
    
    if (!isset($params['groups'][0])) {
        $params['groups'][0] = array();
    }
    
    $params['groups'][0] = array_merge($params['groups'][0], $grouptemplate);
    
    return $params;
} 