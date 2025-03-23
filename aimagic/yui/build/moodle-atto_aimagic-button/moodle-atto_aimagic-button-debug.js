YUI.add('moodle-atto_aimagic-button', function (Y, NAME) {

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
    },
    // Add debug mode constant
    DEBUG = true;

/**
 * Safe substring helper to avoid type errors
 * 
 * @param {any} str The input that should be a string
 * @param {Number} start The start index
 * @param {Number} end The end index
 * @return {String} The substring or empty string if input is not a string
 */
function safeSubstring(str, start, end) {
    if (typeof str !== 'string') {
        return '';
    }
    if (end !== undefined) {
        return str.substring(start, end);
    }
    return str.substring(start);
}

/**
 * Ensure value is a string
 * 
 * @param {any} val The value to convert to string
 * @return {String} The string value or empty string if null/undefined
 */
function ensureString(val) {
    if (val === undefined || val === null) {
        return '';
    }
    return String(val);
}

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
        // Debug initialization
        if (DEBUG) {
            console.log(LOGNAME + ': Initializing AI Magic button');
        }
        
        // Add the AI Magic button
        this.addButton({
            icon: 'e/magic-wand',  // Using standard Moodle icon format
            iconComponent: 'atto_aimagic',
            buttonName: 'aimagic',  // This must match what's in the toolbar config
            callback: this._displayDialogue,
            title: 'inserttextprompt'
        });
        
        // Check for pluginconfig access path first
        var apiKey = '';
        var assistantId = '';
        var baseUrl = 'https://api.openai.com';
        var timeout = 30;
        
        try {
            // First try a different approach - Moodle passes plugin specific config through host.get('pluginconfig')
            var host = this.get('host');
            if (DEBUG) {
                console.log(LOGNAME + ': Host object:', host);
            }
            
            // Method 1: Check for plugins.aimagic property (new structure in some Moodle versions)
            if (M.cfg && M.cfg.plugins && M.cfg.plugins.atto && M.cfg.plugins.atto.aimagic) {
                var cfgPlugin = M.cfg.plugins.atto.aimagic;
                console.log(LOGNAME + ': Found plugin config via M.cfg.plugins.atto.aimagic', cfgPlugin);
                
                apiKey = cfgPlugin.apikey || '';
                assistantId = cfgPlugin.assistantid || '';
                baseUrl = cfgPlugin.baseurl || baseUrl;
                timeout = cfgPlugin.timeout || timeout;
            }
            // Method 2: Check for our specific aimagic config passed in the params
            else if (this.get('aimagic')) {
                var aimagicConfig = this.get('aimagic');
                console.log(LOGNAME + ': Found plugin config via this.get(aimagic)', aimagicConfig);
                
                apiKey = aimagicConfig.apikey || '';
                assistantId = aimagicConfig.assistantid || '';
                baseUrl = aimagicConfig.baseurl || baseUrl;
                timeout = aimagicConfig.timeout || timeout;
            }
            // Method 3: Check for host.pluginconfig.aimagic (standard Moodle way)
            else if (host && host.get('pluginconfig') && host.get('pluginconfig').aimagic) {
                var pluginConfig = host.get('pluginconfig').aimagic;
                console.log(LOGNAME + ': Found plugin config via host.pluginconfig.aimagic', pluginConfig);
                
                apiKey = pluginConfig.apikey || '';
                assistantId = pluginConfig.assistantid || '';
                baseUrl = pluginConfig.baseurl || baseUrl;
                timeout = pluginConfig.timeout || timeout;
            }
            // Method 4: Check for individual parameters (as we were doing before)
            else {
                console.log(LOGNAME + ': No plugin config found via plugin config methods, falling back to direct attributes');
                
                apiKey = this.get('apikey') || '';
                assistantId = this.get('assistantid') || '';
                baseUrl = this.get('baseurl') || baseUrl;
                timeout = this.get('timeout') || timeout;
            }
        } catch (e) {
            console.error(LOGNAME + ': Error getting plugin config:', e);
            // Fallback to normal attributes
            apiKey = this.get('apikey') || '';
            assistantId = this.get('assistantid') || '';
            baseUrl = this.get('baseurl') || baseUrl;
            timeout = this.get('timeout') || timeout;
        }
        
        // Store API settings
        this._apiSettings = {
            apiKey: apiKey,
            assistantId: assistantId,
            baseUrl: baseUrl,
            timeout: timeout
        };
        
        if (DEBUG) {
            console.log(LOGNAME + ': Plugin configuration loaded', {
                apiKeyLength: this._apiSettings.apiKey ? this._apiSettings.apiKey.length : 0,
                assistantIdLength: this._apiSettings.assistantId ? this._apiSettings.assistantId.length : 0,
                hasApiKey: !!this._apiSettings.apiKey,
                hasAssistantId: !!this._apiSettings.assistantId,
                baseUrl: this._apiSettings.baseUrl,
                timeout: this._apiSettings.timeout,
                allProps: Object.keys(this)
            });
            
            // Direct access to config values
            console.log(LOGNAME + ': Direct config access', {
                apikey: this.get('apikey'),
                apikey_type: typeof this.get('apikey'),
                apikey_length: this.get('apikey') ? this.get('apikey').length : 0,
                assistantid: this.get('assistantid'),
                assistantid_type: typeof this.get('assistantid'),
                assistantid_length: this.get('assistantid') ? this.get('assistantid').length : 0,
                baseurl: this.get('baseurl'),
                timeout: this.get('timeout')
            });
            
            // Log full M.cfg for debugging
            if (M && M.cfg) {
                console.log(LOGNAME + ': M.cfg available:', M.cfg);
                if (M.cfg.plugins) {
                    console.log(LOGNAME + ': M.cfg.plugins available:', M.cfg.plugins);
                }
            }
            
            // Inspect all our attributes
            var allAttrs = this.getAttrs();
            console.log(LOGNAME + ': All button attributes:', allAttrs);
            
            // Inspect the plugin configuration data via the host
            try {
                var host = this.get('host');
                if (!host) {
                    console.log(LOGNAME + ': Host is not available');
                } else {
                    var allAttrs = host.getAttrs();
                    console.log(LOGNAME + ': Host attributes', {
                        hasPluginConfig: !!allAttrs.pluginconfig,
                        pluginConfigKeys: allAttrs.pluginconfig ? Object.keys(allAttrs.pluginconfig) : []
                    });
                    
                    if (allAttrs.pluginconfig) {
                        console.log(LOGNAME + ': All plugin configs', allAttrs.pluginconfig);
                        
                        if (allAttrs.pluginconfig.aimagic) {
                            console.log(LOGNAME + ': AI Magic plugin config', allAttrs.pluginconfig.aimagic);
                        } else {
                            console.log(LOGNAME + ': AI Magic plugin config not found in host.pluginconfig');
                        }
                    }
                }
            } catch (e) {
                console.error(LOGNAME + ': Error inspecting host attributes', e);
            }
        }
    },

    /**
     * Display the AI Magic dialogue.
     *
     * @method _displayDialogue
     * @private
     */
    _displayDialogue: function() {
        if (DEBUG) {
            console.log(LOGNAME + ': Display dialogue called');
        }
        
        // Store the current selection.
        this._currentSelection = this.get('host').getSelection();
        if (this._currentSelection === false) {
            if (DEBUG) {
                console.log(LOGNAME + ': No valid selection found');
            }
            return;
        }

        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('dialogtitle', COMPONENTNAME),
            width: '500px',
            focusAfterHide: true
        });
        
        if (DEBUG) {
            console.log(LOGNAME + ': Dialogue created', dialogue);
        }

        // Set the dialogue content.
        var content = this._getDialogueContent();
        
        if (DEBUG) {
            console.log(LOGNAME + ': Dialogue content created', {
                contentType: typeof content,
                contentIsNode: content instanceof Y.Node,
                content: content
            });
        }
        
        dialogue.set('bodyContent', content);

        // Display the dialogue.
        dialogue.show();
        
        if (DEBUG) {
            console.log(LOGNAME + ': Dialogue shown');
        }
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
                '<div class="form-group insertion-mode-container">' +
                    '<label>{{insertionModelabel}}</label>' +
                    '<div class="toggle-switch-container">' +
                        '<div class="toggle-switch">' +
                            '<input type="checkbox" id="{{elementid}}_insertion_mode_toggle" class="toggle-input">' +
                            '<label for="{{elementid}}_insertion_mode_toggle" class="toggle-label"></label>' +
                        '</div>' +
                        '<div class="toggle-labels">' +
                            '<span class="replace-label selected">{{replaceContent}}</span>' +
                            '<span class="add-label">{{addContent}}</span>' +
                        '</div>' +
                    '</div>' +
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
                '<div class="debug-info" style="margin-top: 20px; display: ' + (DEBUG ? 'block' : 'none') + ';">' +
                    '<h5>Debug Information</h5>' +
                    '<div class="debug-log" style="background: #f5f5f5; padding: 10px; max-height: 150px; overflow-y: auto; font-family: monospace; font-size: 12px;"></div>' +
                '</div>' +
            '</div>'
        );

        var content = Y.Node.create(template({
            elementid: this.get('host').get('elementid'),
            CSS: CSS,
            promptlabel: M.util.get_string('promptlabel', COMPONENTNAME),
            insertionModelabel: M.util.get_string('insertionmodelabel', COMPONENTNAME) || 'Insertion Mode',
            generatebutton: M.util.get_string('generatebutton', COMPONENTNAME),
            cancel: M.util.get_string('cancel', COMPONENTNAME),
            processing: M.util.get_string('processing', COMPONENTNAME),
            replaceContent: M.util.get_string('replacecontent', COMPONENTNAME) || 'Replace Content',
            addContent: M.util.get_string('addcontent', COMPONENTNAME) || 'Add Content'
        }));

        // Get any selected text to pre-populate the prompt
        var selectedContent = '';
        
        if (DEBUG) {
            console.log(LOGNAME + ': Getting selection content');
            
            // Debug toggle container existence
            console.log(LOGNAME + ': Checking insertion-mode-container', {
                exists: !!content.one('.insertion-mode-container'),
                html: content.one('.insertion-mode-container') ? content.one('.insertion-mode-container').get('outerHTML') : 'not found'
            });
            
            // Check toggle-switch-container
            console.log(LOGNAME + ': Checking toggle-switch-container', {
                exists: !!content.one('.toggle-switch-container'),
                html: content.one('.toggle-switch-container') ? content.one('.toggle-switch-container').get('outerHTML') : 'not found'
            });
            
            // Check toggle-switch
            console.log(LOGNAME + ': Checking toggle-switch', {
                exists: !!content.one('.toggle-switch'),
                html: content.one('.toggle-switch') ? content.one('.toggle-switch').get('outerHTML') : 'not found'
            });
        }
        
        if (this._currentSelection && typeof this._currentSelection.toString === 'function') {
            if (DEBUG) {
                console.log(LOGNAME + ': Selection exists and has toString method');
            }
            try {
                selectedContent = ensureString(this._currentSelection.toString());
                if (DEBUG) {
                    console.log(LOGNAME + ': Selection content: ', safeSubstring(selectedContent, 0, 100) + 
                        (selectedContent.length > 100 ? '...' : ''));
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Error getting selection text', e);
                    this._addDebugMessage(content, 'Error getting selection: ' + e.message);
                }
            }
        } else {
            if (DEBUG) {
                console.log(LOGNAME + ': No valid selection or toString method missing');
                this._addDebugMessage(content, 'No valid selection or toString method missing');
            }
        }
        
        // Select all editor content if nothing is selected
        if (!selectedContent) {
            if (DEBUG) {
                console.log(LOGNAME + ': No selection, getting all editor content');
            }
            try {
                var editorContent = this.get('host').getSelection(true);
                selectedContent = ensureString(editorContent);
                if (DEBUG) {
                    console.log(LOGNAME + ': Editor content type: ' + typeof editorContent);
                    console.log(LOGNAME + ': Editor content: ', safeSubstring(selectedContent, 0, 100) + 
                        (selectedContent.length > 100 ? '...' : ''));
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Error getting editor content', e);
                    this._addDebugMessage(content, 'Error getting editor content: ' + e.message);
                }
            }
        }
        
        var promptArea = content.one('.' + CSS.INPUTPROMPT);
        
        // Handle generate button.
        content.one('.' + CSS.INPUTSUBMIT).on('click', function(e) {
            e.preventDefault();
            var promptText = promptArea.get('value');
            if (promptText) {
                // Store a reference to the dialogue content for later use
                this._dialogueContent = content;
                
                // Show processing indicator
                content.one('.' + CSS.PROCESSING).setStyle('display', 'block');
                content.one('.' + CSS.INPUTSUBMIT).set('disabled', true);
                content.one('.' + CSS.INPUTCANCEL).set('disabled', true);
                
                if (DEBUG) {
                    console.log(LOGNAME + ': Generate button clicked, prompt: ', safeSubstring(promptText, 0, 100) + 
                        (promptText.length > 100 ? '...' : ''));
                    this._addDebugMessage(content, 'Calling API with prompt: ' + safeSubstring(promptText, 0, 50) + 
                        (promptText.length > 50 ? '...' : ''));
                }
                
                // Call the OpenAI API
                this._callOpenAI(promptText, selectedContent);
            } else {
                if (DEBUG) {
                    console.log(LOGNAME + ': Empty prompt, not submitting');
                    this._addDebugMessage(content, 'Empty prompt, not submitting');
                }
            }
        }, this);

        // Handle cancel button.
        content.one('.' + CSS.INPUTCANCEL).on('click', function(e) {
            e.preventDefault();
            if (DEBUG) {
                console.log(LOGNAME + ': Cancel button clicked');
            }
            this._dialogueContent = null;
            this.getDialogue({
                focusAfterHide: null
            }).hide();
        }, this);
        
        // Set up the toggle functionality
        var toggleInput = content.one('#' + this.get('host').get('elementid') + '_insertion_mode_toggle');
        var replaceLabel = content.one('.replace-label');
        var addLabel = content.one('.add-label');
        
        toggleInput.on('change', function(e) {
            if (e.target.get('checked')) {
                replaceLabel.removeClass('selected');
                addLabel.addClass('selected');
                if (DEBUG) {
                    console.log(LOGNAME + ': Toggle changed to Add mode');
                    this._addDebugMessage(content, 'Insertion mode changed to Add');
                }
            } else {
                replaceLabel.addClass('selected');
                addLabel.removeClass('selected');
                if (DEBUG) {
                    console.log(LOGNAME + ': Toggle changed to Replace mode');
                    this._addDebugMessage(content, 'Insertion mode changed to Replace');
                }
            }
        }, this);
        
        if (DEBUG) {
            this._addDebugMessage(content, 'Dialogue content created successfully');
        }
        
        // Make sure we're returning a YUI Node
        if (content instanceof Y.Node) {
            if (DEBUG) {
                console.log(LOGNAME + ': Returning YUI Node');
            }
            return content;
        } else {
            if (DEBUG) {
                console.error(LOGNAME + ': Content is not a YUI Node, converting');
            }
            // Try to convert to Node if needed
            return Y.Node.create(content.toString());
        }
    },
    
    /**
     * Add a debug message to the debug log area
     *
     * @method _addDebugMessage
     * @param {Node} content The dialogue content
     * @param {String} message The message to add
     * @private
     */
    _addDebugMessage: function(content, message) {
        if (!DEBUG) {
            return;
        }
        
        // If content is not provided, try to use stored reference
        if (!content && this._dialogueContent) {
            content = this._dialogueContent;
        }
        
        if (!content || typeof content.one !== 'function') {
            console.error(LOGNAME + ': Error adding debug message - Invalid content');
            return;
        }
        
        try {
            var debugLog = content.one('.debug-log');
            if (debugLog) {
                var timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.sss
                var msgNode = Y.Node.create('<div><span style="color:#999;">[' + timestamp + ']</span> ' + message + '</div>');
                debugLog.append(msgNode);
                
                var domNode = debugLog.getDOMNode();
                if (domNode && typeof domNode.scrollTop !== 'undefined') {
                    domNode.scrollTop = domNode.scrollHeight;
                }
            }
        } catch (e) {
            console.error(LOGNAME + ': Error adding debug message', e);
        }
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
        
        // Ensure we're working with strings
        promptText = ensureString(promptText);
        selectedContent = ensureString(selectedContent);
        
        // Use stored dialogue content reference
        var content = this._dialogueContent;
        var dialogue = this.getDialogue();
        
        if (DEBUG) {
            console.log(LOGNAME + ': _callOpenAI called', {
                promptLength: promptText ? promptText.length : 0,
                selectedContentLength: selectedContent ? selectedContent.length : 0,
                contentExists: !!content,
                dialogueExists: !!dialogue
            });
        }
        
        // Check for API settings
        if (!this._apiSettings || !this._apiSettings.apiKey || !this._apiSettings.assistantId) {
            if (DEBUG) {
                console.log(LOGNAME + ': API settings check', {
                    hasApiSettings: !!this._apiSettings,
                    hasApiKey: this._apiSettings ? !!this._apiSettings.apiKey : false,
                    hasAssistantId: this._apiSettings ? !!this._apiSettings.assistantId : false
                });
            }
            var errorMsg = 'OpenAI API key or Assistant ID not configured. Please check the plugin settings.';
            if (DEBUG) {
                console.error(LOGNAME + ': ' + errorMsg);
                
                if (content) {
                    this._addDebugMessage(content, 'Error: ' + errorMsg);
                }
            }
            this._handleApiError(errorMsg);
            return;
        }
        
        // Get the entire editor content if there's no selection
        var editorContent = '';
        if (!selectedContent) {
            try {
                var host = this.get('host');
                editorContent = ensureString(host.getHTML());
                if (DEBUG) {
                    console.log(LOGNAME + ': Got editor content', {
                        length: editorContent.length,
                        sample: safeSubstring(editorContent, 0, 100) + (editorContent.length > 100 ? '...' : '')
                    });
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Failed to get editor content', e);
                }
            }
        } else {
            editorContent = selectedContent;
        }
        
        // Create the prompt with context
        var fullPrompt = '';
        if (editorContent && editorContent.trim()) {
            fullPrompt = 'Context:\n\n' + editorContent + '\n\nUser Request:\n' + promptText + 
                '\n\nPlease respond with HTML including appropriate inline CSS styling for Moodle.';
        } else {
            fullPrompt = 'User Request:\n' + promptText + 
                '\n\nPlease respond with HTML including appropriate inline CSS styling for Moodle.';
        }
        
        if (DEBUG) {
            console.log(LOGNAME + ': Final prompt prepared', {
                length: fullPrompt.length,
                withContext: !!editorContent
            });
            
            if (content) {
                this._addDebugMessage(content, 'Sending API request with ' + 
                    (editorContent ? 'editor content as context' : 'no context'));
            }
        }
        
        // Use YUI IO to make the API request
        Y.io(M.cfg.wwwroot + '/lib/editor/atto/plugins/aimagic/ajax.php', {
            method: 'POST',
            data: {
                sesskey: M.cfg.sesskey,
                action: 'generate',
                contextid: this.get('contextid'),
                prompt: fullPrompt,
                apikey: this._apiSettings.apiKey,
                assistantid: this._apiSettings.assistantId,
                baseurl: this._apiSettings.baseUrl,
                timeout: this._apiSettings.timeout
            },
            on: {
                start: function() {
                    if (DEBUG) {
                        console.log(LOGNAME + ': API request started');
                        
                        if (content) {
                            self._addDebugMessage(content, 'API request started');
                        }
                    }
                },
                success: function(id, response) {
                    if (DEBUG) {
                        console.log(LOGNAME + ': API request succeeded', {
                            responseLength: response && response.responseText ? response.responseText.length : 0,
                            statusCode: response ? response.status : 'unknown'
                        });
                        
                        if (content) {
                            self._addDebugMessage(content, 'API request succeeded: Status ' + 
                                (response ? response.status : 'unknown'));
                        }
                    }
                    
                    try {
                        if (!response || !response.responseText) {
                            throw new Error('Empty response received');
                        }
                        
                        var data = JSON.parse(response.responseText);
                        
                        if (DEBUG) {
                            console.log(LOGNAME + ': API response parsed', {
                                success: !!data.success,
                                hasContent: !!data.content,
                                error: data.error || 'none'
                            });
                            
                            if (content) {
                                self._addDebugMessage(content, 'API response parsed: ' + 
                                    (data.success ? 'Success' : 'Failed'));
                            }
                        }
                        
                        if (data.success && data.content) {
                            if (DEBUG) {
                                console.log(LOGNAME + ': Inserting content', {
                                    contentLength: data.content.length
                                });
                                
                                if (content) {
                                    self._addDebugMessage(content, 'Content received, length: ' + data.content.length);
                                }
                            }
                            self._insertContent(data.content, selectedContent);
                        } else {
                            var errorMsg = data.error || 'Unknown API error';
                            if (DEBUG) {
                                console.error(LOGNAME + ': API error', errorMsg);
                                
                                if (content) {
                                    self._addDebugMessage(content, 'API error: ' + errorMsg);
                                }
                            }
                            self._handleApiError(errorMsg);
                        }
                    } catch (e) {
                        if (DEBUG) {
                            console.error(LOGNAME + ': Error parsing API response', e);
                            console.log('Response text:', response ? safeSubstring(response.responseText, 0, 500) : 'none');
                            
                            if (content) {
                                self._addDebugMessage(content, 'Error parsing response: ' + e.message);
                            }
                        }
                        self._handleApiError('Error processing response: ' + e.message);
                    }
                },
                failure: function(id, response) {
                    var statusMsg = response ? 'Status: ' + response.status : 'No status';
                    if (DEBUG) {
                        console.error(LOGNAME + ': API request failed', {
                            id: id,
                            statusCode: response ? response.status : 'unknown',
                            statusText: response ? response.statusText : 'unknown'
                        });
                        
                        if (content) {
                            self._addDebugMessage(content, 'API request failed: ' + statusMsg);
                        }
                    }
                    self._handleApiError('Network error. ' + statusMsg);
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
        // Use stored dialogue content reference if available
        var content = this._dialogueContent;
        var dialogue = this.getDialogue();
        
        if (DEBUG) {
            console.log(LOGNAME + ': _handleApiError called', {
                errorMessage: errorMessage,
                contentExists: !!content,
                dialogueExists: !!dialogue
            });
        }
        
        // Ensure we have a valid dialogue
        if (!dialogue) {
            console.error(LOGNAME + ': Error handling API error: Dialogue not found');
            return;
        }
        
        // If we don't have content from stored reference, try to get it from dialogue
        if (!content) {
            try {
                content = dialogue.get('bodyContent');
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Error getting dialogue content', e);
                }
            }
        }
        
        if (DEBUG) {
            console.log(LOGNAME + ': Got dialogue content', {
                contentExists: !!content,
                contentType: content ? typeof content : 'undefined',
                contentIsNode: content ? content instanceof Y.Node : false
            });
        }
        
        // Ensure the bodyContent is valid
        if (!content || typeof content.one !== 'function') {
            console.error(LOGNAME + ': Error handling API error: Invalid dialogue content');
            
            if (DEBUG) {
                // Try to create a new content area with just the error message
                try {
                    var errorContent = Y.Node.create('<div class="atto_aimagic_error"><div class="alert alert-danger" role="alert">' + 
                        errorMessage + '</div><button class="btn btn-secondary atto_aimagic_close">Close</button></div>');
                    
                    if (dialogue && typeof dialogue.set === 'function') {
                        dialogue.set('bodyContent', errorContent);
                        
                        errorContent.one('.atto_aimagic_close').on('click', function(e) {
                            e.preventDefault();
                            dialogue.hide();
                        });
                        
                        console.log(LOGNAME + ': Created error fallback content');
                    }
                } catch (e) {
                    console.error(LOGNAME + ': Failed to create fallback error content', e);
                }
            }
            
            return;
        }
        
        try {
            // Add debug message
            this._addDebugMessage(content, 'Error: ' + errorMessage);
            
            // Hide the processing indicator
            var processingEl = content.one('.' + CSS.PROCESSING);
            if (processingEl) {
                processingEl.setStyle('display', 'none');
                if (DEBUG) {
                    console.log(LOGNAME + ': Processing indicator hidden');
                }
            } else {
                if (DEBUG) {
                    console.log(LOGNAME + ': Processing indicator element not found');
                }
            }
            
            // Enable buttons
            var submitBtn = content.one('.' + CSS.INPUTSUBMIT);
            var cancelBtn = content.one('.' + CSS.INPUTCANCEL);
            
            if (submitBtn) {
                submitBtn.set('disabled', false);
                if (DEBUG) {
                    console.log(LOGNAME + ': Submit button re-enabled');
                }
            } else {
                if (DEBUG) {
                    console.log(LOGNAME + ': Submit button not found');
                }
            }
            
            if (cancelBtn) {
                cancelBtn.set('disabled', false);
                if (DEBUG) {
                    console.log(LOGNAME + ': Cancel button re-enabled');
                }
            } else {
                if (DEBUG) {
                    console.log(LOGNAME + ': Cancel button not found');
                }
            }
            
            // Show the error message
            var errorDiv = Y.Node.create('<div class="alert alert-danger" role="alert">' + errorMessage + '</div>');
            var promptEl = content.one('.' + CSS.INPUTPROMPT);
            
            if (promptEl && promptEl.next) {
                content.insert(errorDiv, promptEl.next());
                if (DEBUG) {
                    console.log(LOGNAME + ': Error message inserted after prompt element');
                }
            } else {
                // Fallback insertion if next is not available
                content.append(errorDiv);
                if (DEBUG) {
                    console.log(LOGNAME + ': Error message appended to content (fallback)');
                }
            }
            
            // Auto-remove the error after 5 seconds
            setTimeout(function() {
                if (errorDiv && typeof errorDiv.remove === 'function') {
                    errorDiv.remove(true);
                    if (DEBUG) {
                        console.log(LOGNAME + ': Error message removed after timeout');
                    }
                } else {
                    if (DEBUG) {
                        console.log(LOGNAME + ': Could not remove error message after timeout');
                    }
                }
            }, 5000);
        } catch (e) {
            console.error(LOGNAME + ': Error handling API error display:', e);
        }
    },

    /**
     * Insert content into the editor, trying multiple methods to ensure success.
     *
     * @method _insertContent
     * @param {String} content The content to insert
     * @param {Boolean} addContent If true, add content after existing, otherwise replace
     * @private
     */
    _insertContent: function(content, addContent) {
        if (DEBUG) {
            console.log(LOGNAME + ': Inserting content, add mode: ' + (addContent ? 'true' : 'false'));
        }
        
        var host = this.get('host');
        
        // Ensure we're working with strings
        if (content === null || content === undefined) {
            content = '';
        }
        
        if (typeof content !== 'string') {
            if (DEBUG) {
                console.warn(LOGNAME + ': Content is not a string, attempting to convert');
            }
            try {
                content = content.toString();
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Failed to convert content to string', e);
                }
                content = '';
            }
        }
        
        // Append the AI-assisted icon SVG at the end of the content
        var aiAssistantIconUrl = M.cfg.wwwroot + '/lib/editor/atto/plugins/aimagic/pix/ai_assisted_button.svg';
        content = content + ' <img src="' + aiAssistantIconUrl + '" alt="AI-generated content" title="This content was generated by AI" class="ai-assisted-content-badge" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 5px;" />';
        
        if (DEBUG) {
            console.log(LOGNAME + ': Content prepared for insertion with AI icon, length: ' + content.length);
        }

        // Make sure any dialog is hidden first to prevent focus issues
        this.getDialogue({focusAfterHide: false}).hide();
        
        try {
            // Focus the editor
            host.focus();
            
            if (addContent) {
                // For add content mode, simply insert at focus point
                host.insertContentAtFocusPoint(content);
                if (DEBUG) {
                    console.log(LOGNAME + ': Content added at cursor position');
                }
            } else {
                // For replace content mode
                var selection = host.getSelection();
                
                if (selection && selection.toString().length > 0) {
                    // We have a selection to replace
                    try {
                        // First try the standard Atto method with range
                        var range = host.getSelectionRange();
                        if (range) {
                            // Delete the current selection
                            range.deleteContents();
                            
                            // Create a fragment with our content
                            var tempDiv = document.createElement('div');
                            tempDiv.innerHTML = content;
                            var fragment = document.createDocumentFragment();
                            while (tempDiv.firstChild) {
                                fragment.appendChild(tempDiv.firstChild);
                            }
                            
                            // Insert the fragment
                            range.insertNode(fragment);
                            
                            if (DEBUG) {
                                console.log(LOGNAME + ': Content replaced selection using range');
                            }
                        } else {
                            throw new Error('No valid range found');
                        }
                    } catch (e) {
                        if (DEBUG) {
                            console.error(LOGNAME + ': Range replacement failed, trying execCommand', e);
                        }
                        
                        try {
                            // Try execCommand as fallback
                            document.execCommand('insertHTML', false, content);
                            if (DEBUG) {
                                console.log(LOGNAME + ': Content replaced using execCommand');
                            }
                        } catch (e2) {
                            if (DEBUG) {
                                console.error(LOGNAME + ': execCommand failed too, using setHTML', e2);
                            }
                            
                            // If that fails too, just replace the entire content
                            if (typeof host.setHTML === 'function') {
                                host.setHTML(content);
                                if (DEBUG) {
                                    console.log(LOGNAME + ': Content replaced using setHTML');
                                }
                            } else {
                                // Final fallback
                                host.insertContentAtFocusPoint(content);
                                if (DEBUG) {
                                    console.log(LOGNAME + ': Content inserted at cursor (final fallback)');
                                }
                            }
                        }
                    }
                } else {
                    // If no selection, replace entire editor content
                    if (typeof host.setHTML === 'function') {
                        host.setHTML(content);
                        if (DEBUG) {
                            console.log(LOGNAME + ': Replaced entire editor content');
                        }
                    } else {
                        // Fallback if setHTML is not available
                        host.insertContentAtFocusPoint(content);
                        if (DEBUG) {
                            console.log(LOGNAME + ': Content inserted at cursor (no selection)');
                        }
                    }
                }
            }
            this.markUpdated();
        } catch (error) {
            if (DEBUG) {
                console.error(LOGNAME + ': Error inserting content:', error);
            }
            
            // Ultimate fallback - try the simplest possible approach
            try {
                if (DEBUG) {
                    console.log(LOGNAME + ': Trying ultimate fallback insertion');
                }
                host.focus();
                if (!addContent && typeof host.setHTML === 'function') {
                    host.setHTML(content);
                    if (DEBUG) {
                        console.log(LOGNAME + ': Ultimate fallback using setHTML');
                    }
                } else {
                    host.insertContentAtFocusPoint(content);
                    if (DEBUG) {
                        console.log(LOGNAME + ': Ultimate fallback using insertContentAtFocusPoint');
                    }
                }
                this.markUpdated();
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Ultimate fallback insertion also failed:', e);
                }
            }
        }
    }
});

}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin", "moodle-core-notification-dialogue", "io-base", "json-parse"]}); 