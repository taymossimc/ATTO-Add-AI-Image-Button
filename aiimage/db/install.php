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
 * Atto AI Image - Installation script
 *
 * @package    atto_aiimage
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Custom code to be run on installing the plugin.
 */
function xmldb_atto_aiimage_install() {
    global $CFG, $DB;

    // Set default config for API key.
    set_config('apikey', '', 'atto_aiimage');
    
    // Set default config for base URL.
    set_config('baseurl', 'https://api.stability.ai', 'atto_aiimage');
    
    // Set default config for stability model.
    set_config('model', 'stable-diffusion-xl-1024-v1-0', 'atto_aiimage');
    
    // Set default timeout.
    set_config('timeout', '30', 'atto_aiimage');
    
    return true;
} 