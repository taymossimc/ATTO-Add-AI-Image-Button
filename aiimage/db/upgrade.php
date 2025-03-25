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
 * Atto AI Image plugin upgrade script.
 *
 * @package    atto_aiimage
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Upgrade the atto_aiimage plugin.
 *
 * @param int $oldversion The old version of the plugin
 * @return bool
 */
function xmldb_atto_aiimage_upgrade($oldversion) {
    global $DB;
    
    $dbman = $DB->get_manager();
    
    if ($oldversion < 2024032412) {
        // Define table atto_aiimage to be created
        $table = new xmldb_table('atto_aiimage');
        
        // Adding fields to table atto_aiimage
        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table->add_field('userid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
        $table->add_field('prompt', XMLDB_TYPE_TEXT, null, null, null, null, null);
        $table->add_field('timecreated', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
        
        // Adding keys to table atto_aiimage
        $table->add_key('primary', XMLDB_KEY_PRIMARY, array('id'));
        $table->add_key('userid', XMLDB_KEY_FOREIGN, array('userid'), 'user', array('id'));
        
        // Create the table if it doesn't exist
        if (!$dbman->table_exists($table)) {
            $dbman->create_table($table);
        }
        
        // Set default configuration
        set_config('apikey', '', 'atto_aiimage');
        set_config('baseurl', 'https://api.stability.ai', 'atto_aiimage');
        set_config('model', 'stable-diffusion-xl-1024-v1-0', 'atto_aiimage');
        set_config('timeout', '30', 'atto_aiimage');
        
        // Upgrade savepoint reached
        upgrade_plugin_savepoint(true, 2024032412, 'atto', 'aiimage');
    }
    
    return true;
} 