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
    
    // Install the AI assisted icon SVG to the file system.
    $fs = get_file_storage();
    $context = context_system::instance();
    
    // Path to the SVG file in the plugin.
    $svgpath = $CFG->dirroot . '/lib/editor/atto/plugins/aimagic/pix/ai_assisted_button.svg';
    
    // Check if the file exists.
    if (file_exists($svgpath)) {
        // Prepare file record.
        $fileinfo = [
            'contextid' => $context->id,
            'component' => 'atto_aimagic',
            'filearea' => 'icon',
            'itemid' => 0,
            'filepath' => '/',
            'filename' => 'ai_assisted_button.svg',
        ];
        
        // Delete existing file if one exists.
        if ($fs->file_exists($context->id, 'atto_aimagic', 'icon', 0, '/', 'ai_assisted_button.svg')) {
            $file = $fs->get_file($context->id, 'atto_aimagic', 'icon', 0, '/', 'ai_assisted_button.svg');
            $file->delete();
        }
        
        // Create the file.
        $fs->create_file_from_pathname($fileinfo, $svgpath);
    }
    
    return true;
} 