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
 * Installation script for atto_aimagic.
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Custom code to be run on installing the plugin.
 */
function xmldb_atto_aimagic_install() {
    global $CFG;
    
    // Add the aimagic button to the editor toolbar.
    $toolbar = get_config('editor_atto', 'toolbar');
    
    // Determine if we need to add the button to the toolbar.
    if (strpos($toolbar, 'aimagic') === false) {
        // Find a good group to add it to (insert, format, or other).
        $groups = explode("\n", $toolbar);
        $insertgroup = null;
        
        foreach ($groups as $i => $group) {
            if (strpos($group, 'insert') === 0) {
                $insertgroup = $i;
                break;
            }
        }
        
        // If we found the insert group, add our button to it.
        if ($insertgroup !== null) {
            $groups[$insertgroup] = $groups[$insertgroup] . ', aimagic';
            $newtoolbar = implode("\n", $groups);
            
            // Update the configuration.
            set_config('toolbar', $newtoolbar, 'editor_atto');
        }
    }
    
    return true;
} 