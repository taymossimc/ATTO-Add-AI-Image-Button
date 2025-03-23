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
 * Atto AI Magic web services.
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$functions = array(
    'atto_aimagic_test_connection' => array(
        'classname'     => 'atto_aimagic\external\test_connection',
        'methodname'    => 'execute',
        'description'   => 'Tests the connection to OpenAI API using the provided credentials',
        'type'          => 'write',
        'capabilities'  => 'moodle/site:config',
        'ajax'          => true,
    ),
);

// We define the services to install as pre-build services. A pre-build service is not editable by administrator.
$services = array(
    'Atto AI Magic services' => array(
        'functions' => array(
            'atto_aimagic_test_connection',
        ),
        'restrictedusers' => 0,
        'enabled' => 1,
    ),
); 