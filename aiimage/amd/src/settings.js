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
 * Atto AI Image AMD module.
 *
 * @module     atto_aiimage/settings
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/ajax', 'core/notification', 'core/str', 'core/config'], function($, Ajax, Notification, Str, Config) {
    /**
     * Settings for the AI Image plugin
     */
    var settings = {
        /**
         * Initialize the settings module
         *
         * @method init
         */
        init: function() {
            console.log('AI Image settings loaded');
            
            // Transfer settings from YUI to AMD if needed
            if (typeof M !== 'undefined' && 
                typeof M.atto_aiimage !== 'undefined' && 
                typeof M.atto_aiimage.settings !== 'undefined') {
                
                // Copy the settings
                this.hasapikey = M.atto_aiimage.settings.hasapikey;
                this.model = M.atto_aiimage.settings.model;
                this.baseurl = M.atto_aiimage.settings.baseurl;
                this.timeout = M.atto_aiimage.settings.timeout;
                this.contextid = M.atto_aiimage.settings.contextid;
            }
            
            // Setup the test connection button
            this.setupTestConnectionButton();
        },

        /**
         * Set up the test connection button
         */
        setupTestConnectionButton: function() {
            var button = $('#atto_aiimage_test_connection');
            if (button.length) {
                button.on('click', this.testConnection.bind(this));
                console.log('Test connection button initialized');
            } else {
                console.log('Test connection button not found');
            }
        },
        
        /**
         * Test the connection to the Stability AI API
         * 
         * @param {Event} e The click event
         */
        testConnection: function(e) {
            e.preventDefault();
            
            // Get values directly from the form
            var apikey = $('input[name="s_atto_aiimage_apikey"]').val();
            var baseurl = $('input[name="s_atto_aiimage_baseurl"]').val();
            var model = $('select[name="s_atto_aiimage_model"]').val();
            var resultContainer = $('#atto_aiimage_connection_result');
            
            console.log('Testing connection with model: ' + model);
            
            // Check if API key is provided
            if (!apikey) {
                Str.get_string('testconnection_apikey_missing', 'atto_aiimage')
                    .then(function(message) {
                        resultContainer.html('<span class="text-danger">' + message + '</span>');
                        return;
                    })
                    .catch(Notification.exception);
                return;
            }
            
            // Show testing message
            Str.get_string('testconnection_testing', 'atto_aiimage')
                .then(function(message) {
                    resultContainer.html('<span class="text-info">' + message + '</span>');
                    return;
                })
                .catch(Notification.exception);
            
            // Create request params
            var params = {
                action: 'test',
                contextid: this.contextid || 0,
                sesskey: Config.sesskey,
                prompt: 'test connection', // Required by the ajax.php script
                apikey: apikey,
                baseurl: baseurl,
                model: model,
                timeout: this.timeout || 30,
                aspectratio: 'square'
            };
            
            console.log('Sending test request to: ' + Config.wwwroot + '/lib/editor/atto/plugins/aiimage/ajax.php');
            
            // Send the AJAX request directly to ajax.php
            $.ajax({
                method: 'POST',
                url: Config.wwwroot + '/lib/editor/atto/plugins/aiimage/ajax.php',
                data: params,
                dataType: 'json',
                success: function(response) {
                    console.log('Test connection response:', response);
                    
                    if (response.success) {
                        Str.get_string('testconnection_success', 'atto_aiimage')
                            .then(function(message) {
                                resultContainer.html('<span class="text-success">' + message + '</span>');
                                
                                // Show popup
                                Str.get_string('test_success_popup', 'atto_aiimage')
                                    .then(function(message) {
                                        Notification.addNotification({
                                            message: message,
                                            type: 'success'
                                        });
                                        return;
                                    })
                                    .catch(Notification.exception);
                                
                                return;
                            })
                            .catch(Notification.exception);
                    } else {
                        Str.get_string('testconnection_error', 'atto_aiimage')
                            .then(function(message) {
                                resultContainer.html('<span class="text-danger">' + message + ': ' + response.error + '</span>');
                                
                                // Show popup
                                Str.get_string('test_error_popup', 'atto_aiimage')
                                    .then(function(message) {
                                        Notification.addNotification({
                                            message: message + ' ' + response.error,
                                            type: 'error'
                                        });
                                        return;
                                    })
                                    .catch(Notification.exception);
                                
                                return;
                            })
                            .catch(Notification.exception);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('AJAX Error:', error);
                    
                    Str.get_string('testconnection_error', 'atto_aiimage')
                        .then(function(message) {
                            resultContainer.html('<span class="text-danger">' + message + ': ' + error + '</span>');
                            return;
                        })
                        .catch(Notification.exception);
                }
            });
        },

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

    return settings;
}); 