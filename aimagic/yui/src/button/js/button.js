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
 * Atto AI Magic insert button - YUI file
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_aimagic-button
 */

/**
 * Atto text editor AI Magic plugin.
 *
 * @namespace M.atto_aimagic
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

var COMPONENTNAME = 'atto_aimagic',
    LOGNAME = 'atto_aimagic',
    CSS = {
        INPUTSUBMIT: 'atto_aimagic_submit',
        INPUTCANCEL: 'atto_aimagic_cancel',
        INPUTPROMPT: 'atto_aimagic_prompt',
        PROCESSING: 'atto_aimagic_processing'
    };

Y.namespace('M.atto_aimagic').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    /**
     * A reference to the current selection at the time that the dialogue
     * was opened.
     *
     * @property _currentSelection
     * @type Range
     * @private
     */
    _currentSelection: null,
    
    /**
     * Configuration settings for the OpenAI API
     * 
     * @property _apiSettings
     * @type Object
     * @private
     */
    _apiSettings: null,

    initializer: function() {
        // Add the AI Magic button
        this.addButton({
            icon: 'magic-wand',  // This will be a custom icon we'll create
            iconComponent: 'atto_aimagic',
            buttonName: 'aimagic',  // This must match what's in the toolbar config
            callback: this._displayDialogue,
            title: 'inserttextprompt'
        });
        
        // Store API settings from plugin config
        this._apiSettings = {
            apiKey: this.get('apikey'),
            agentId: this.get('agentid'),
            baseUrl: this.get('baseurl'),
            timeout: this.get('timeout')
        };
    },

    /**
     * Display the AI Magic dialogue.
     *
     * @method _displayDialogue
     * @private
     */
    _displayDialogue: function() {
        // Store the current selection.
        this._currentSelection = this.get('host').getSelection();
        if (this._currentSelection === false) {
            return;
        }

        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('dialogtitle', COMPONENTNAME),
            width: '500px',
            focusAfterHide: true
        });

        // Set the dialogue content.
        var content = this._getDialogueContent();
        dialogue.set('bodyContent', content);

        // Display the dialogue.
        dialogue.show();
    },

    /**
     * Return the dialogue content for the tool.
     *
     * @method _getDialogueContent
     * @private
     * @return {Node} The content to place in the dialogue.
     */
    _getDialogueContent: function() {
        var template = Y.Handlebars.compile(
            '<div class="atto_aimagic_form">' +
                '<div class="form-group">' +
                    '<label for="{{elementid}}_atto_aimagic_prompt">{{promptlabel}}</label>' +
                    '<textarea class="form-control {{CSS.INPUTPROMPT}}" id="{{elementid}}_atto_aimagic_prompt" rows="5"></textarea>' +
                '</div>' +
                '<div class="{{CSS.PROCESSING}} text-center" style="display: none;">' +
                    '<p>{{processing}}</p>' +
                    '<div class="spinner-border" role="status">' +
                        '<span class="sr-only">Loading...</span>' +
                    '</div>' +
                '</div>' +
                '<div class="mdl-align">' +
                    '<br/>' +
                    '<button class="btn btn-primary {{CSS.INPUTSUBMIT}}">{{generatebutton}}</button>' +
                    ' ' +
                    '<button class="btn btn-secondary {{CSS.INPUTCANCEL}}">{{cancel}}</button>' +
                '</div>' +
            '</div>'
        );

        var content = Y.Node.create(template({
            elementid: this.get('host').get('elementid'),
            CSS: CSS,
            promptlabel: M.util.get_string('promptlabel', COMPONENTNAME),
            generatebutton: M.util.get_string('generatebutton', COMPONENTNAME),
            cancel: M.util.get_string('cancel', COMPONENTNAME),
            processing: M.util.get_string('processing', COMPONENTNAME)
        }));

        // Get any selected text to pre-populate the prompt
        var selectedContent = '';
        if (this._currentSelection && this._currentSelection.toString().length) {
            selectedContent = this._currentSelection.toString();
        }
        
        // Select all editor content if nothing is selected
        if (!selectedContent) {
            selectedContent = this.get('host').getSelection(true);
        }
        
        var promptArea = content.one('.' + CSS.INPUTPROMPT);
        
        // Handle generate button.
        content.one('.' + CSS.INPUTSUBMIT).on('click', function(e) {
            e.preventDefault();
            var promptText = promptArea.get('value');
            if (promptText) {
                // Show processing indicator
                content.one('.' + CSS.PROCESSING).setStyle('display', 'block');
                content.one('.' + CSS.INPUTSUBMIT).set('disabled', true);
                content.one('.' + CSS.INPUTCANCEL).set('disabled', true);
                
                // Call the OpenAI API
                this._callOpenAI(promptText, selectedContent);
            }
        }, this);

        // Handle cancel button.
        content.one('.' + CSS.INPUTCANCEL).on('click', function(e) {
            e.preventDefault();
            this.getDialogue({
                focusAfterHide: null
            }).hide();
        }, this);

        return content;
    },

    /**
     * Call the OpenAI Agents API with the prompt and selected content
     *
     * @method _callOpenAI
     * @param {String} promptText The user's prompt/request
     * @param {String} selectedContent Any selected content from the editor
     * @private
     */
    _callOpenAI: function(promptText, selectedContent) {
        var self = this;
        
        // Check if the API key and Agent ID are configured
        if (!this._apiSettings.apiKey || !this._apiSettings.agentId) {
            this._handleApiError('OpenAI API key or Agent ID not configured. Please check the plugin settings.');
            return;
        }
        
        // Create the prompt with context if available
        var prompt = promptText;
        if (selectedContent) {
            prompt = 'Here is the existing content:\n\n' + selectedContent + '\n\n' + promptText + 
                '\n\nPlease respond with HTML including appropriate inline CSS styling for Moodle.';
        } else {
            prompt = promptText + '\n\nPlease respond with HTML including appropriate inline CSS styling for Moodle.';
        }
        
        // Use YUI IO to make the API request
        Y.io(M.cfg.wwwroot + '/lib/editor/atto/plugins/aimagic/ajax.php', {
            method: 'POST',
            data: {
                sesskey: M.cfg.sesskey,
                action: 'generate',
                contextid: this.get('contextid'),
                prompt: prompt,
                apikey: this._apiSettings.apiKey,
                agentid: this._apiSettings.agentId,
                baseurl: this._apiSettings.baseUrl,
                timeout: this._apiSettings.timeout
            },
            on: {
                success: function(id, response) {
                    try {
                        var data = JSON.parse(response.responseText);
                        if (data.success && data.content) {
                            self._insertContent(data.content);
                        } else {
                            self._handleApiError(data.error || 'Unknown error');
                        }
                    } catch (e) {
                        self._handleApiError('Error processing response');
                    }
                },
                failure: function() {
                    self._handleApiError('Network error');
                }
            },
            timeout: this._apiSettings.timeout * 1000
        });
    },
    
    /**
     * Handle API errors
     *
     * @method _handleApiError
     * @param {String} errorMessage The error message to display
     * @private
     */
    _handleApiError: function(errorMessage) {
        // Hide the processing indicator
        var dialogue = this.getDialogue();
        var content = dialogue.get('bodyContent');
        content.one('.' + CSS.PROCESSING).setStyle('display', 'none');
        content.one('.' + CSS.INPUTSUBMIT).set('disabled', false);
        content.one('.' + CSS.INPUTCANCEL).set('disabled', false);
        
        // Show the error message
        var errorDiv = Y.Node.create('<div class="alert alert-danger" role="alert">' + errorMessage + '</div>');
        content.insert(errorDiv, content.one('.' + CSS.INPUTPROMPT).next());
        
        // Auto-remove the error after 5 seconds
        setTimeout(function() {
            errorDiv.remove(true);
        }, 5000);
    },

    /**
     * Insert the generated content into the editor.
     *
     * @method _insertContent
     * @param {String} content The HTML content to insert
     * @private
     */
    _insertContent: function(content) {
        var dialogue = this.getDialogue();
        
        // Close the dialogue
        dialogue.hide();
        
        // Set the selection and insert the content
        this.get('host').setSelection(this._currentSelection);
        
        // If there's a selection, replace it, otherwise insert at cursor
        if (this._currentSelection && this._currentSelection.toString().length) {
            this.get('host').insertContentAtFocusPoint(content);
        } else {
            this.get('host').insertContentAtFocusPoint(content);
        }
        
        this.markUpdated();
    }
});

/**
 * Initialization function for the AI Magic YUI module
 * 
 * @method init
 * @param {Object} config Configuration parameters
 * @static
 */
Y.M.atto_aimagic.Button.init = function(config) {
    return true;
}; 