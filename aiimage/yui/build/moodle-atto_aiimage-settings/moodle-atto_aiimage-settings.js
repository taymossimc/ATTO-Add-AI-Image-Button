YUI.add('moodle-atto_aiimage-settings', function (Y, NAME) {

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
 * Atto AI Image plugin settings.
 *
 * @package    atto_aiimage
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_aiimage-settings
 */
M.atto_aiimage = M.atto_aiimage || {};

/**
 * Settings for the AI Image plugin.
 */
M.atto_aiimage.settings = {
    /**
     * Indicator for API key status
     */
    hasapikey: false,
    
    /**
     * The selected model
     */
    model: '',
    
    /**
     * The base URL for the Stability API
     */
    baseurl: '',
    
    /**
     * Request timeout in seconds
     */
    timeout: 30,
    
    /**
     * Context ID
     */
    contextid: 0
};

}, '@VERSION@', {"requires": []}); 