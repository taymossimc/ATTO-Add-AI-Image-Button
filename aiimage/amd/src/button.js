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
 * Atto AI Image button AMD module.
 *
 * @module     atto_aiimage/button
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/log', 'atto_aiimage/settings'], function($, log, settings) {
    /**
     * Button handler for AI Image generation
     */
    var button = {
        /**
         * Initialize the button
         *
         * @method init
         */
        init: function() {
            log.debug('AI Image button initialized');
            // This is just a stub as the YUI module handles most functionality
        }
    };

    return button;
}); 