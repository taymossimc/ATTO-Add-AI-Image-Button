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
 * Atto template plugin installation script.
 *
 * @package    atto_template
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Custom installation procedure.
 */
function xmldb_atto_template_install() {
    global $CFG;
    
    // Add template button to the Atto toolbar config if not already there.
    if (isset($CFG->texteditorconfig)) {
        $config = json_decode($CFG->texteditorconfig, true);
        
        if (isset($config['atto']['toolbar'])) {
            $toolbarconfig = $config['atto']['toolbar'];
            $found = false;
            
            // Check if template is already in a toolbar group.
            foreach ($toolbarconfig as $group) {
                if (strpos($group, 'template') !== false) {
                    $found = true;
                    break;
                }
            }
            
            // If not found, add to the first group.
            if (!$found && !empty($toolbarconfig)) {
                $groups = array_keys($toolbarconfig);
                $firstgroup = $groups[0];
                
                if (!empty($toolbarconfig[$firstgroup])) {
                    $toolbarconfig[$firstgroup] .= ' = ' . $toolbarconfig[$firstgroup] . ', template';
                    
                    $config['atto']['toolbar'] = $toolbarconfig;
                    set_config('texteditorconfig', json_encode($config));
                }
            }
        }
    }
    
    return true;
} 