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
 * Upgrade script for atto_aimagic.
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Upgrade function for atto_aimagic.
 *
 * @param int $oldversion The old version of the plugin.
 * @return bool
 */
function xmldb_atto_aimagic_upgrade($oldversion) {
    global $DB, $CFG;
    
    $dbman = $DB->get_manager();
    
    if ($oldversion < 2025040601) {
        // Define the table structure for usage logging if needed in future upgrades.
        // Placeholder for future upgrades.
        
        // Save upgrade marker.
        upgrade_plugin_savepoint(true, 2025040601, 'atto', 'aimagic');
    }
    
    if ($oldversion < 2025040718) {
        // Migrate the 'agentid' setting to 'assistantid'
        $oldvalue = get_config('atto_aimagic', 'agentid');
        if (!empty($oldvalue)) {
            // Save the old value to the new setting
            set_config('assistantid', $oldvalue, 'atto_aimagic');
            
            // Log the migration for debugging
            error_log('AI Magic plugin: Migrated agentid setting to assistantid: ' . $oldvalue);
        }
        
        // Save upgrade marker
        upgrade_plugin_savepoint(true, 2025040718, 'atto', 'aimagic');
    }
    
    if ($oldversion < 2025040726) {
        // Update the AI assisted icon SVG in the file system.
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

        // Aimagic savepoint reached.
        upgrade_plugin_savepoint(true, 2025040726, 'atto', 'aimagic');
    }
    
    if ($oldversion < 2025040923) {
        // Check and fix the Atto toolbar configuration
        $toolbar = get_config('editor_atto', 'toolbar');
        
        // Log the current toolbar config for debugging
        error_log('AI Magic plugin: Current Atto toolbar configuration: ' . $toolbar);
        
        // Check if our button is properly registered in the toolbar
        if (strpos($toolbar, 'aimagic') === false) {
            // Find a good group to add it to (insert, format, or other)
            $groups = explode("\n", $toolbar);
            $insertgroup = null;
            
            foreach ($groups as $i => $group) {
                if (strpos($group, 'insert') === 0) {
                    $insertgroup = $i;
                    break;
                }
            }
            
            // If we found the insert group, add our button to it
            if ($insertgroup !== null) {
                $groups[$insertgroup] = $groups[$insertgroup] . ', aimagic';
                $newtoolbar = implode("\n", $groups);
                
                // Update the configuration
                set_config('toolbar', $newtoolbar, 'editor_atto');
                error_log('AI Magic plugin: Added aimagic to Atto toolbar configuration: ' . $newtoolbar);
            } else {
                error_log('AI Magic plugin: Could not find insert group in Atto toolbar configuration');
            }
        } else {
            error_log('AI Magic plugin: aimagic already in Atto toolbar configuration');
        }
        
        // Aimagic savepoint reached
        upgrade_plugin_savepoint(true, 2025040923, 'atto', 'aimagic');
    }
    
    if ($oldversion < 2025040924) {
        // Reduce console logging when not in debug mode
        error_log('AI Magic plugin: Updated console logging to reduce output in production mode');
        
        // Aimagic savepoint reached
        upgrade_plugin_savepoint(true, 2025040924, 'atto', 'aimagic');
    }
    
    if ($oldversion < 2025040925) {
        // Update both standard and minified JavaScript files with consistent console logging
        error_log('AI Magic plugin: Updated both JavaScript files with consistent console logging');
        
        // Aimagic savepoint reached
        upgrade_plugin_savepoint(true, 2025040925, 'atto', 'aimagic');
    }
    
    if ($oldversion < 2025040926) {
        // Security fix: Prevent API keys from being logged to the console
        error_log('AI Magic plugin: Security fix - API keys are no longer logged to the browser console');
        
        // Aimagic savepoint reached
        upgrade_plugin_savepoint(true, 2025040926, 'atto', 'aimagic');
    }
    
    return true;
} 