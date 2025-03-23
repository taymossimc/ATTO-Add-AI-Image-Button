/**
 * Settings page JavaScript for Atto AI Magic plugin.
 *
 * @module      atto_aimagic/settings
 * @copyright   2025 CHURCHx
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/str', 'core/ajax', 'core/notification'], function($, Str, Ajax, Notification) {
    
    /**
     * Initialize the settings page
     */
    var init = function() {
        console.log('Atto AI Magic settings JS initialized');
        var button = $('#atto_aimagic_test_connection');
        var resultSpan = $('#atto_aimagic_connection_result');
        var detailsDiv = $('#atto_aimagic_connection_details');
        
        console.log('Test connection button found:', button.length > 0);
        
        // Load string promises for later use
        var stringPromises = [
            {key: 'testconnection_testing', component: 'atto_aimagic'},
            {key: 'testconnection_success', component: 'atto_aimagic'},
            {key: 'testconnection_error', component: 'atto_aimagic'},
            {key: 'testconnection_assistant_valid', component: 'atto_aimagic'},
            {key: 'testconnection_assistant_invalid', component: 'atto_aimagic'},
            {key: 'testconnection_apikey_missing', component: 'atto_aimagic'},
            {key: 'testconnection_assistant_missing', component: 'atto_aimagic'},
            {key: 'test_success_popup', component: 'atto_aimagic'},
            {key: 'test_error_popup', component: 'atto_aimagic'}
        ];
        
        var strings = {};
        Str.get_strings(stringPromises).then(function(loadedStrings) {
            strings.testing = loadedStrings[0];
            strings.success = loadedStrings[1];
            strings.error = loadedStrings[2];
            strings.assistantValid = loadedStrings[3];
            strings.assistantInvalid = loadedStrings[4];
            strings.apikeyMissing = loadedStrings[5];
            strings.assistantMissing = loadedStrings[6];
            strings.testSuccessPopup = loadedStrings[7];
            strings.testErrorPopup = loadedStrings[8];
            
            button.on('click', function(e) {
                console.log('Test connection button clicked');
                // Prevent default form submission
                e.preventDefault();
                
                var apiKey = $('input[name="s_atto_aimagic_apikey"]').val();
                var assistantId = $('input[name="s_atto_aimagic_assistantid"]').val();
                var baseUrl = $('input[name="s_atto_aimagic_baseurl"]').val();
                
                console.log('Values collected:', !!apiKey, !!assistantId, !!baseUrl);
                
                if (!apiKey) {
                    resultSpan.html('<span class="text-danger">' + strings.apikeyMissing + '</span>');
                    detailsDiv.hide();
                    Notification.alert('', strings.testErrorPopup + ': ' + strings.apikeyMissing);
                    return;
                }
                
                if (!assistantId) {
                    resultSpan.html('<span class="text-danger">' + strings.assistantMissing + '</span>');
                    detailsDiv.hide();
                    Notification.alert('', strings.testErrorPopup + ': ' + strings.assistantMissing);
                    return;
                }
                
                resultSpan.html('<span class="text-info">' + strings.testing + ' <i class="fa fa-spinner fa-spin"></i></span>');
                detailsDiv.hide();
                
                var request = {
                    methodname: 'atto_aimagic_test_connection',
                    args: {
                        apikey: apiKey,
                        assistantid: assistantId,
                        baseurl: baseUrl
                    }
                };
                
                console.log('Making AJAX call with request:', request);
                
                Ajax.call([request])[0].done(function(response) {
                    console.log('AJAX call succeeded with response:', response);
                    if (response.success) {
                        resultSpan.html('<span class="text-success">' + strings.success + ' ' + strings.assistantValid + '</span>');
                        if (response.details) {
                            detailsDiv.html('<div class="alert alert-info">' + response.details + '</div>');
                            detailsDiv.show();
                        } else {
                            detailsDiv.hide();
                        }
                        // Show success popup
                        Notification.alert('', strings.testSuccessPopup);
                    } else {
                        resultSpan.html('<span class="text-danger">' + strings.error + ' ' + response.error + '</span>');
                        if (response.details) {
                            detailsDiv.html('<div class="alert alert-warning">' + response.details + '</div>');
                            detailsDiv.show();
                        } else {
                            detailsDiv.hide();
                        }
                        // Show error popup
                        Notification.alert('', strings.testErrorPopup + ': ' + response.error);
                    }
                }).fail(function(error) {
                    console.log('AJAX call failed with error:', error);
                    resultSpan.html('<span class="text-danger">' + strings.error + ' ' + error.message + '</span>');
                    detailsDiv.hide();
                    Notification.exception(error);
                    // Show error popup
                    Notification.alert('', strings.testErrorPopup + ': ' + error.message);
                });
            });
        }).catch(Notification.exception);
    };
    
    return {
        init: init
    };
}); 