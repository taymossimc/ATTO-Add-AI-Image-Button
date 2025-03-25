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
 * Web service declarations for atto_aiimage.
 *
 * @package    atto_aiimage
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$functions = array(
    'atto_aiimage_test_connection' => array(
        'classname'     => 'atto_aiimage_external',
        'methodname'    => 'test_connection',
        'classpath'     => 'lib/editor/atto/plugins/aiimage/classes/external.php',
        'description'   => 'Tests the connection to the Stability.ai API',
        'type'          => 'write',
        'loginrequired' => true,
        'ajax'          => true
    )
); 