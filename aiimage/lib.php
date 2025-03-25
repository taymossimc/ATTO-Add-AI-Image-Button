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
 * Atto AI Image plugin lib.
 *
 * @package    atto_aiimage
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Initialise the js strings required for this module.
 */
function atto_aiimage_strings_for_js() {
    global $PAGE;

    $strings = array(
        'pluginname',
        'dialogtitle',
        'promptlabel',
        'aspectratiolabel',
        'aspectratio_square',
        'aspectratio_landscape',
        'aspectratio_portrait',
        'generatebutton',
        'cancel',
        'processing',
        'error'
    );

    $PAGE->requires->strings_for_js($strings, 'atto_aiimage');
}

/**
 * Get params for this plugin.
 *
 * @param string $elementid
 * @param stdClass $options
 * @param stdClass $fpoptions
 * @return array
 */
function atto_aiimage_params_for_js($elementid, $options, $fpoptions) {
    global $USER, $COURSE, $PAGE;
    
    // Debug information
    error_log('AI Image plugin: params_for_js called');
    
    $context = $options['context'];
    if (!$context) {
        $context = context_course::instance($COURSE->id);
    }
    
    // Get the configured settings
    $apikey = get_config('atto_aiimage', 'apikey');
    $model = get_config('atto_aiimage', 'model');
    $baseurl = get_config('atto_aiimage', 'baseurl');
    $timeout = get_config('atto_aiimage', 'timeout');
    
    // Make sure we have default values if settings are empty
    if (empty($baseurl)) {
        $baseurl = 'https://api.stability.ai';
    }
    
    if (empty($model)) {
        $model = 'stable-diffusion-xl-1024-v1-0';
    }
    
    if (empty($timeout)) {
        $timeout = 30;
    }
    
    // Check if an API key is set
    $hasapikey = !empty($apikey);
    
    // Initialize YUI modules
    atto_aiimage_strings_for_js();
    
    // Initialize the settings in the YUI namespace
    $module = array(
        'name' => 'moodle-atto_aiimage-button',
        'fullpath' => '/lib/editor/atto/plugins/aiimage/yui/build/moodle-atto_aiimage-button/moodle-atto_aiimage-button.js',
        'requires' => array(
            'moodle-editor_atto-plugin',
            'moodle-core-notification-dialogue'
        )
    );
    $PAGE->requires->js_module($module);

    // Make sure the M.atto_aiimage namespace exists
    $initnamespace = "
        if (typeof M.atto_aiimage === 'undefined') {
            M.atto_aiimage = {};
        }
        M.atto_aiimage.settings = {
            hasapikey: " . json_encode($hasapikey) . ",
            model: " . json_encode($model) . ",
            baseurl: " . json_encode($baseurl) . ",
            timeout: " . json_encode($timeout) . ",
            contextid: " . json_encode($context->id) . "
        };
    ";
    $PAGE->requires->js_init_code($initnamespace, true);
    
    // Prepare the parameters for JS
    return array(
        'contextid' => $context->id,
        'hasapikey' => $hasapikey,
        'model' => $model,
        'baseurl' => $baseurl,
        'timeout' => $timeout,
        'sesskey' => sesskey()
    );
}

/**
 * Serve the files from the atto_aiimage file areas
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
function atto_aiimage_pluginfile($course, $cm, $context, $filearea, $args, $forcedownload, $options = array()) {
    // Debug logging to track file access attempts
    error_log('atto_aiimage_pluginfile called: ' . json_encode([
        'context' => $context->id,
        'contextlevel' => $context->contextlevel,
        'filearea' => $filearea,
        'args' => $args
    ]));

    // Make sure the filearea is one of those used by the plugin.
    if ($filearea !== 'aiimagecontent') {
        return false;
    }

    // The user needs to be logged in to access these files
    require_login($course, false, $cm);

    // Important: Do not restrict by context level - accept any valid context
    // This is crucial because the Atto editor might be used in various contexts:
    // system, course, module, or block

    // Extract the filename and filepath from the $args array.
    $itemid = array_shift($args);
    $filename = array_pop($args);
    $filepath = $args ? '/'.implode('/', $args).'/' : '/';

    // Debug logging for file path information
    error_log('atto_aiimage_pluginfile paths: ' . json_encode([
        'context' => $context->id,
        'itemid' => $itemid,
        'filepath' => $filepath,
        'filename' => $filename
    ]));

    // Retrieve the file from the Files API.
    $fs = get_file_storage();
    $file = $fs->get_file($context->id, 'atto_aiimage', $filearea, $itemid, $filepath, $filename);
    
    if (!$file) {
        error_log('atto_aiimage_pluginfile: File not found');
        return false; // The file does not exist.
    }

    // Send the file to the user.
    error_log('atto_aiimage_pluginfile: Serving file ' . $file->get_filename());
    send_stored_file($file, 86400, 0, $forcedownload, $options);
}

/**
 * Add the AI image button to the Atto toolbar.
 *
 * @param array $params
 * @param stdClass $context
 * @param array $options
 * @return array
 */
function atto_aiimage_setup_toolbar($params, $context, $options) {
    // Capability check.
    if (has_capability('atto/aiimage:visible', $context)) {
        $icon = 'icon';

        return array(
            'icon' => $icon,
            'iconComponent' => 'atto_aiimage',
            'buttonName' => 'aiimage',
            'tags' => 'img',
            'tagMatchRequiresAll' => false
        );
    }

    return array();
} 