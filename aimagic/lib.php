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
 * Atto AI Magic plugin lib.
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Initialise the js strings required for this module.
 */
function atto_aimagic_strings_for_js() {
    global $PAGE;

    $strings = array(
        'pluginname',
        'inserttextprompt',
        'dialogtitle',
        'promptlabel',
        'generatebutton',
        'cancel',
        'processing',
        'error',
        'useprompt',
        'replacecontent',
        'addcontent',
        'insertionmodelabel'
    );

    $PAGE->requires->strings_for_js($strings, 'atto_aimagic');
}

/**
 * Get params for this plugin.
 *
 * @param string $elementid
 * @param stdClass $options
 * @param stdClass $fpoptions
 * @return array
 */
function atto_aimagic_params_for_js($elementid, $options, $fpoptions) {
    global $USER, $COURSE;
    
    // Debug information
    error_log('AI Magic plugin: params_for_js called');
    
    $context = $options['context'];
    if (!$context) {
        $context = context_course::instance($COURSE->id);
    }
    
    // Get the configured settings
    $config = get_config('atto_aimagic');
    
    // Debug log the configuration
    error_log('AI Magic plugin config: ' . json_encode([
        'apikey_length' => isset($config->apikey) ? strlen($config->apikey) : 0,
        'assistantid_length' => isset($config->assistantid) ? strlen($config->assistantid) : 0,
        'baseurl' => isset($config->baseurl) ? $config->baseurl : 'not set',
        'timeout' => isset($config->timeout) ? $config->timeout : 'not set',
        'config_type' => gettype($config),
        'config_keys' => is_object($config) ? get_object_vars($config) : []
    ]));
    
    // Make sure we're actually fetching the settings from the database
    $apikey = get_config('atto_aimagic', 'apikey');
    $assistantid = get_config('atto_aimagic', 'assistantid');
    
    // Backward compatibility - try the old setting name if the new one is empty
    if (empty($assistantid)) {
        $assistantid = get_config('atto_aimagic', 'agentid');
        error_log('AI Magic plugin: Using fallback agentid setting: ' . (empty($assistantid) ? 'still empty' : 'found'));
    }
    
    $baseurl = get_config('atto_aimagic', 'baseurl');
    $timeout = get_config('atto_aimagic', 'timeout');
    
    error_log('AI Magic plugin direct config values: ' . json_encode([
        'apikey_length' => strlen($apikey),
        'assistantid_length' => strlen($assistantid),
        'baseurl' => $baseurl,
        'timeout' => $timeout
    ]));
    
    // This is the standard way params are passed to the YUI module
    $params = array();
    
    // These params are passed directly to the YUI module
    $params['apikey'] = $apikey;
    $params['assistantid'] = $assistantid;
    $params['baseurl'] = !empty($baseurl) ? $baseurl : 'https://api.openai.com';
    $params['timeout'] = !empty($timeout) ? $timeout : 30;
    $params['contextid'] = $context->id;
    
    // IMPORTANT: This is how settings should be registered for the YUI module's pluginconfig property
    // See MDL-41407 for how Moodle passes parameters to Atto plugins
    
    // First method - direct params
    $params['aimagic'] = array(
        'apikey' => $apikey,
        'assistantid' => $assistantid,
        'baseurl' => !empty($baseurl) ? $baseurl : 'https://api.openai.com',
        'timeout' => !empty($timeout) ? $timeout : 30
    );
    
    // Second method - register via pluginconfig (this is the standard Moodle way)
    if (!isset($params['pluginconfig'])) {
        $params['pluginconfig'] = array();
    }
    $params['pluginconfig']['aimagic'] = array(
        'apikey' => $apikey,
        'assistantid' => $assistantid,
        'baseurl' => !empty($baseurl) ? $baseurl : 'https://api.openai.com',
        'timeout' => !empty($timeout) ? $timeout : 30
    );
    
    // Third method - register via Moodle's plugin namespace
    // This registers the settings with M.cfg.plugins.atto.aimagic
    global $PAGE;
    $namespace = 'atto/aimagic';
    $moduleconfig = array(
        'apikey' => $apikey,
        'assistantid' => $assistantid,
        'baseurl' => !empty($baseurl) ? $baseurl : 'https://api.openai.com',
        'timeout' => !empty($timeout) ? $timeout : 30
    );
    $PAGE->requires->js_init_call('M.cfg.plugins = M.cfg.plugins || {}; M.cfg.plugins.atto = M.cfg.plugins.atto || {}; M.cfg.plugins.atto.aimagic = ' . json_encode($moduleconfig) . ';', array(), false);
    
    error_log('AI Magic plugin params: ' . json_encode(array(
        'apikey_length' => strlen($params['apikey']),
        'assistantid_length' => strlen($params['assistantid']),
        'baseurl' => $params['baseurl'],
        'timeout' => $params['timeout'],
        'contextid' => $params['contextid'],
        'has_aimagic_config' => isset($params['aimagic']),
        'has_pluginconfig' => isset($params['pluginconfig']),
        'has_pluginconfig_aimagic' => isset($params['pluginconfig']['aimagic'])
    )));

    return $params;
}

/**
 * Set the order of buttons in the toolbar.
 *
 * @param array $params
 * @return array
 */
function atto_aimagic_setup_toolbar_params(array $params) {
    // The button must be called 'aimagic' (without atto_ prefix) in the toolbar configuration
    $groupaimagic = array('aimagic');

    // Add the aimagic button to the first group (format group).
    if (!isset($params['groups'])) {
        $params['groups'] = array();
    }
    
    if (!isset($params['groups'][0])) {
        $params['groups'][0] = array();
    }
    
    $params['groups'][0] = array_merge($params['groups'][0], $groupaimagic);
    
    return $params;
}

/**
 * Serve the files from the aimagic file areas.
 *
 * @param stdClass $course the course object
 * @param stdClass $cm the course module object
 * @param stdClass $context the context
 * @param string $filearea the name of the file area
 * @param array $args extra arguments (itemid, path)
 * @param bool $forcedownload whether or not force download
 * @param array $options additional options affecting the file serving
 * @return bool false if the file not found, just send the file otherwise and do not return anything
 */
function atto_aimagic_pluginfile($course, $cm, $context, $filearea, array $args, $forcedownload, array $options = []) {
    // Check the contextlevel is as expected.
    if ($context->contextlevel != CONTEXT_SYSTEM && $context->contextlevel != CONTEXT_COURSE &&
        $context->contextlevel != CONTEXT_MODULE && $context->contextlevel != CONTEXT_USER) {
        return false;
    }

    // Make sure the filearea is one of those used by the plugin.
    if ($filearea !== 'icon') {
        return false;
    }

    // Item id should be 0.
    $itemid = array_shift($args);
    if ($itemid != 0) {
        return false;
    }

    // Extract the filename / filepath from the $args array.
    $filename = array_pop($args);
    if (empty($args)) {
        $filepath = '/';
    } else {
        $filepath = '/' . implode('/', $args) . '/';
    }

    // Retrieve the file from the Files API.
    $fs = get_file_storage();
    $file = $fs->get_file($context->id, 'atto_aimagic', $filearea, $itemid, $filepath, $filename);
    if (!$file) {
        return false;
    }

    // We can now send the file back to the browser with caching for 1 day and no filtering.
    send_stored_file($file, 86400, 0, $forcedownload, $options);
} 