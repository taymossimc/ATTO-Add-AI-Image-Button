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
    // Enable console logging for errors regardless of debug mode
    DEBUG = false,
    // Add logging functions that work regardless of debug setting
    consoleLog = function(msg, data) {
        // Only log in debug mode
        if (DEBUG) {
            console.log(LOGNAME + ': ' + msg, data);
        }
    },
    consoleError = function(msg, error) {
        // Only log critical errors in production mode
        if (DEBUG || error && error.critical) {
            console.error(LOGNAME + ': ' + msg, error);
        }
    };

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
        consoleLog('Initializing AI Magic button');
        
        try {
            // Add the AI Magic button
            this.addButton({
                icon: 'e/magic-wand',  // Using standard Moodle icon format
                iconComponent: 'atto_aimagic',
                buttonName: 'aimagic',  // This must match what's in the toolbar config
                callback: this._displayDialogue,
                title: 'inserttextprompt'
            });
            consoleLog('Button added to toolbar');
        } catch (e) {
            consoleError('Error adding button to toolbar', e);
        }
        
        // Check for pluginconfig access path first
        var apiKey = '';
        var assistantId = '';
        var baseUrl = 'https://api.openai.com';
        var timeout = 30;
        
        try {
            // First try a different approach - Moodle passes plugin specific config through host.get('pluginconfig')
            var host = this.get('host');
            consoleLog('Host object:', host);
            
            // Method 1: Check for plugins.aimagic property (new structure in some Moodle versions)
            if (M.cfg && M.cfg.plugins && M.cfg.plugins.atto && M.cfg.plugins.atto.aimagic) {
                var cfgPlugin = M.cfg.plugins.atto.aimagic;
                // Create a sanitized copy of the config for logging (without sensitive data)
                var sanitizedConfig = {
                    apikey: cfgPlugin.apikey ? "********" : "",
                    assistantid: cfgPlugin.assistantid || '',
                    baseurl: cfgPlugin.baseurl || baseUrl,
                    timeout: cfgPlugin.timeout || timeout
                };
                consoleLog('Found plugin config via M.cfg.plugins.atto.aimagic', sanitizedConfig);
                
                apiKey = cfgPlugin.apikey || '';
                assistantId = cfgPlugin.assistantid || '';
                baseUrl = cfgPlugin.baseurl || baseUrl;
                timeout = cfgPlugin.timeout || timeout;
            }
            // Method 2: Check for our specific aimagic config passed in the params
            else if (this.get('aimagic')) {
                var aimagicConfig = this.get('aimagic');
                // Create a sanitized copy of the config for logging (without sensitive data)
                var sanitizedConfig = {
                    apikey: aimagicConfig.apikey ? "********" : "",
                    assistantid: aimagicConfig.assistantid || '',
                    baseurl: aimagicConfig.baseurl || baseUrl,
                    timeout: aimagicConfig.timeout || timeout
                };
                consoleLog('Found plugin config via this.get(aimagic)', sanitizedConfig);
                
                apiKey = aimagicConfig.apikey || '';
                assistantId = aimagicConfig.assistantid || '';
                baseUrl = aimagicConfig.baseurl || baseUrl;
                timeout = aimagicConfig.timeout || timeout;
            }
            // Method 3: Check for host.pluginconfig.aimagic (standard Moodle way)
            else if (host && host.get('pluginconfig') && host.get('pluginconfig').aimagic) {
                var pluginConfig = host.get('pluginconfig').aimagic;
                // Create a sanitized copy of the config for logging (without sensitive data)
                var sanitizedConfig = {
                    apikey: pluginConfig.apikey ? "********" : "",
                    assistantid: pluginConfig.assistantid || '',
                    baseurl: pluginConfig.baseurl || baseUrl,
                    timeout: pluginConfig.timeout || timeout
                };
                consoleLog('Found plugin config via host.pluginconfig.aimagic', sanitizedConfig);
                
                apiKey = pluginConfig.apikey || '';
                assistantId = pluginConfig.assistantid || '';
                baseUrl = pluginConfig.baseurl || baseUrl;
                timeout = pluginConfig.timeout || timeout;
            }
            // Method 4: Check for individual parameters (as we were doing before)
            else {
                consoleLog('No plugin config found via plugin config methods, falling back to direct attributes');
                
                apiKey = this.get('apikey') || '';
                assistantId = this.get('assistantid') || '';
                baseUrl = this.get('baseurl') || baseUrl;
                timeout = this.get('timeout') || timeout;
            }
        } catch (e) {
            consoleError('Error getting plugin config:', e);
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
        
        consoleLog('Plugin configuration loaded', {
            hasApiKey: !!this._apiSettings.apiKey,
            assistantIdLength: this._apiSettings.assistantId ? this._apiSettings.assistantId.length : 0,
            hasAssistantId: !!this._apiSettings.assistantId,
            baseUrl: this._apiSettings.baseUrl,
            timeout: this._apiSettings.timeout
        });
        
        if (DEBUG) {
            console.log(LOGNAME + ': Direct config access', {
                apikey_length: this.get('apikey') ? this.get('apikey').length : 0,
                apikey_exists: !!this.get('apikey'),
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
        consoleLog('Display dialogue called');
        
        // Store the current selection.
        this._currentSelection = this.get('host').getSelection();
        if (this._currentSelection === false) {
            consoleLog('No valid selection found');
            return;
        }

        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('dialogtitle', COMPONENTNAME),
            width: '500px',
            focusAfterHide: true
        });
        
        consoleLog('Dialogue created', dialogue);

        // Set the dialogue content.
        var content = this._getDialogueContent();
        
        consoleLog('Dialogue content created', {
            contentType: typeof content,
            contentIsNode: content instanceof Y.Node,
            content: content
        });
        
        dialogue.set('bodyContent', content);

        // Display the dialogue.
        dialogue.show();
        
        consoleLog('Dialogue shown');
    },

    /**
     * Return the dialogue content for the tool.
     *
     * @method _getDialogueContent
     * @private
     * @return {Node} The content to place in the dialogue.
     */
    _getDialogueContent: function() {
        try {
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
                    '<div class="debug-info" style="margin-top: 20px; display: none;">' +
                        '<h5>Debug Information</h5>' +
                        '<div class="debug-log" style="background: #f5f5f5; padding: 10px; max-height: 150px; overflow-y: auto; font-family: monospace; font-size: 12px;"></div>' +
                    '</div>' +
                '</div>'
            );

            // Safely get the host and elementid
            var host = this.get('host');
            var elementid = '';
            if (host && typeof host.get === 'function') {
                try {
                    elementid = host.get('elementid') || '';
                } catch (e) {
                    if (DEBUG) {
                        console.error(LOGNAME + ': Error getting elementid', e);
                    }
                    elementid = '';
                }
            }

            var content;
            try {
                content = Y.Node.create(template({
                    elementid: elementid,
                    CSS: CSS,
                    promptlabel: M.util.get_string('promptlabel', COMPONENTNAME),
                    insertionModelabel: M.util.get_string('insertionmodelabel', COMPONENTNAME) || 'Insertion Mode',
                    generatebutton: M.util.get_string('generatebutton', COMPONENTNAME),
                    cancel: M.util.get_string('cancel', COMPONENTNAME),
                    processing: M.util.get_string('processing', COMPONENTNAME),
                    replaceContent: M.util.get_string('replacecontent', COMPONENTNAME) || 'Replace Content',
                    addContent: M.util.get_string('addcontent', COMPONENTNAME) || 'Add Content'
                }));
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Error creating content node', e);
                }
                // Create a very basic fallback content
                content = Y.Node.create('<div class="atto_aimagic_form"><div class="alert alert-danger">Error creating dialog content</div></div>');
                return content;
            }

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
            
            // Safely check if currentSelection exists and has toString method
            if (this._currentSelection && 
                typeof this._currentSelection === 'object' && 
                typeof this._currentSelection.toString === 'function') {
                
                if (DEBUG) {
                    console.log(LOGNAME + ': Selection exists and has toString method');
                }
                
                try {
                    selectedContent = ensureString(this._currentSelection.toString());
                    
                    if (DEBUG && selectedContent) {
                        console.log(LOGNAME + ': Selection content: ', safeSubstring(selectedContent, 0, 100) + 
                            (selectedContent.length > 100 ? '...' : ''));
                    }
                    
                    // Show the insertion mode toggle if there's selected content
                    if (selectedContent && selectedContent.length > 0) {
                        var toggleDiv = content.one('.insertion-mode-toggle');
                        if (toggleDiv) {
                            toggleDiv.setStyle('display', 'block');
                        }
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
            
            // Get the entire editor content if there's no selection
            var editorContent = '';
            if (!selectedContent) {
                if (DEBUG) {
                    console.log(LOGNAME + ': No selection, getting all editor content');
                }
            }
            
            // Setup the prompt area and buttons safely
            var promptArea = content.one('.' + CSS.INPUTPROMPT);
            if (!promptArea) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Prompt area not found');
                }
            } else {
                // Handle generate button.
                var submitButton = content.one('.' + CSS.INPUTSUBMIT);
                if (submitButton) {
                    submitButton.on('click', function(e) {
                        e.preventDefault();
                        var promptText = promptArea.get('value');
                        if (promptText) {
                            // Store a reference to the dialogue content for later use
                            this._dialogueContent = content;
                            
                            // Show processing indicator
                            var processingEl = content.one('.' + CSS.PROCESSING);
                            var submitButtonEl = content.one('.' + CSS.INPUTSUBMIT);
                            var cancelButtonEl = content.one('.' + CSS.INPUTCANCEL);
                            
                            if (processingEl) {
                                processingEl.setStyle('display', 'block');
                            }
                            
                            if (submitButtonEl) {
                                submitButtonEl.set('disabled', true);
                            }
                            
                            if (cancelButtonEl) {
                                cancelButtonEl.set('disabled', true);
                            }
                            
                            if (DEBUG) {
                                console.log(LOGNAME + ': Generate button clicked, prompt: ', safeSubstring(promptText, 0, 100) + 
                                    (promptText.length > 100 ? '...' : ''));
                                this._addDebugMessage(content, 'Calling API with prompt: ' + safeSubstring(promptText, 0, 50) + 
                                    (promptText.length > 50 ? '...' : ''));
                            }
                            
                            // Call the OpenAI API
                            this._callOpenAI(promptText, editorContent);
                        } else {
                            if (DEBUG) {
                                console.log(LOGNAME + ': Empty prompt, not submitting');
                                this._addDebugMessage(content, 'Empty prompt, not submitting');
                            }
                        }
                    }, this);
                }

                // Handle cancel button.
                var cancelButton = content.one('.' + CSS.INPUTCANCEL);
                if (cancelButton) {
                    cancelButton.on('click', function(e) {
                        e.preventDefault();
                        if (DEBUG) {
                            console.log(LOGNAME + ': Cancel button clicked');
                        }
                        this._dialogueContent = null;
                        this.getDialogue({
                            focusAfterHide: null
                        }).hide();
                    }, this);
                }
            }
            
            // Handle toggle switch logic
            var toggleSwitch = content.one('#' + elementid + '_insertion_mode_toggle');
            var replaceLabel = content.one('.replace-label');
            var addLabel = content.one('.add-label');
            
            // Add event listener to toggle switch if all elements exist
            if (toggleSwitch && replaceLabel && addLabel) {
                toggleSwitch.on('change', function(e) {
                    if (toggleSwitch.get('checked')) {
                        // Add mode
                        replaceLabel.removeClass('selected');
                        addLabel.addClass('selected');
                        if (DEBUG) {
                            console.log(LOGNAME + ': Toggle changed to Add mode');
                            this._addDebugMessage(content, 'Insertion mode changed to Add');
                        }
                    } else {
                        // Replace mode
                        replaceLabel.addClass('selected');
                        addLabel.removeClass('selected');
                        if (DEBUG) {
                            console.log(LOGNAME + ': Toggle changed to Replace mode');
                            this._addDebugMessage(content, 'Insertion mode changed to Replace');
                        }
                    }
                }, this);
            } else {
                if (DEBUG) {
                    console.warn(LOGNAME + ': Toggle switch elements not found', {
                        toggleExists: !!toggleSwitch,
                        replaceLabelExists: !!replaceLabel,
                        addLabelExists: !!addLabel
                    });
                }
            }
            
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
                try {
                    return Y.Node.create(content.toString());
                } catch (e) {
                    if (DEBUG) {
                        console.error(LOGNAME + ': Failed to convert content to Node', e);
                    }
                    // Return a basic error message node as fallback
                    return Y.Node.create('<div class="alert alert-danger">Error creating dialogue content</div>');
                }
            }
        } catch (e) {
            if (DEBUG) {
                console.error(LOGNAME + ': Critical error in _getDialogueContent', e);
            }
            // Return a basic error message node as fallback
            return Y.Node.create('<div class="alert alert-danger">Error creating dialogue content</div>');
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
        
        try {
            // Ensure we're working with strings
            promptText = ensureString(promptText);
            selectedContent = ensureString(selectedContent);
            
            // Use stored dialogue content reference
            var content = this._dialogueContent;
            var dialogue = this.getDialogue();
            
            consoleLog('_callOpenAI called', {
                promptLength: promptText ? promptText.length : 0,
                selectedContentLength: selectedContent ? selectedContent.length : 0,
                contentExists: !!content,
                dialogueExists: !!dialogue
            });
            
            // Check for API settings
            if (!this._apiSettings || !this._apiSettings.apiKey || !this._apiSettings.assistantId) {
                consoleLog('API settings check', {
                    hasApiSettings: !!this._apiSettings,
                    hasApiKey: this._apiSettings ? !!this._apiSettings.apiKey : false,
                    hasAssistantId: this._apiSettings ? !!this._apiSettings.assistantId : false
                });
                
                var errorMsg = 'OpenAI API key or Assistant ID not configured. Please check the plugin settings.';
                consoleError(errorMsg);
                
                if (content) {
                    this._addDebugMessage(content, 'Error: ' + errorMsg);
                }
                
                this._handleApiError(errorMsg);
                return;
            }
            
            // Get the entire editor content if there's no selection
            var editorContent = '';
            try {
                if (!selectedContent) {
                    editorContent = this._getEditorContent();
                    consoleLog('Got editor content using _getEditorContent', {
                        contentType: typeof editorContent,
                        length: editorContent ? editorContent.length : 0,
                        sample: editorContent ? safeSubstring(editorContent, 0, 100) + 
                            (editorContent.length > 100 ? '...' : '') : 'Empty'
                    });
                } else {
                    editorContent = selectedContent;
                    consoleLog('Using selected content as editor content');
                }
                
                // Ensure editorContent is a string
                editorContent = ensureString(editorContent);
            } catch (e) {
                consoleError('Error getting editor content', e);
                editorContent = '';
            }
            
            // Create the prompt with context
            var fullPrompt = '';
            try {
                if (editorContent && editorContent.trim && editorContent.trim()) {
                    fullPrompt = 'Context:\n\n' + editorContent + '\n\nUser Request:\n' + promptText + 
                        '\n\nPlease respond with HTML including appropriate inline CSS styling for Moodle.';
                } else {
                    fullPrompt = 'User Request:\n' + promptText + 
                        '\n\nPlease respond with HTML including appropriate inline CSS styling for Moodle.';
                }
                
                consoleLog('Final prompt prepared', {
                    promptType: typeof fullPrompt,
                    length: fullPrompt ? fullPrompt.length : 0,
                    withContext: !!editorContent
                });
                
                if (content) {
                    this._addDebugMessage(content, 'Sending API request with ' + 
                        (editorContent ? 'editor content as context' : 'no context'));
                }
            } catch (e) {
                consoleError('Error creating prompt', e);
                // Fallback to minimal prompt
                fullPrompt = promptText || '';
                
                consoleLog('Using fallback minimal prompt');
            }
            
            // Prepare API request data
            var apiRequestData = {
                sesskey: M.cfg ? M.cfg.sesskey : '',
                action: 'generate',
                contextid: this.get('contextid') || 0,
                prompt: fullPrompt || '',
                apikey: this._apiSettings.apiKey || '',
                assistantid: this._apiSettings.assistantId || '',
                baseurl: this._apiSettings.baseUrl || 'https://api.openai.com',
                timeout: this._apiSettings.timeout || 30
            };
            
            consoleLog('Prepared API request data', {
                hasSesskey: !!apiRequestData.sesskey,
                hasPrompt: !!apiRequestData.prompt,
                promptLength: apiRequestData.prompt ? apiRequestData.prompt.length : 0,
                hasApiKey: !!apiRequestData.apikey,
                assistantIdLength: apiRequestData.assistantid ? apiRequestData.assistantid.length : 0,
                hasAssistantId: !!apiRequestData.assistantid
            });
            
            // Use YUI IO to make the API request
            var wwwroot = M.cfg && M.cfg.wwwroot ? M.cfg.wwwroot : '';
            if (!wwwroot) {
                consoleError('wwwroot is not available');
                this._handleApiError('API request failed: wwwroot not available');
                return;
            }
            
            var apiEndpoint = wwwroot + '/lib/editor/atto/plugins/aimagic/ajax.php';
            consoleLog('Making API request to: ' + apiEndpoint);
            
            Y.io(apiEndpoint, {
                method: 'POST',
                data: apiRequestData,
                on: {
                    success: function(id, response) {
                        consoleLog('API response received', {
                            responseExists: !!response,
                            responseTextLength: response && response.responseText ? response.responseText.length : 0
                        });
                        
                        try {
                            if (!response || !response.responseText) {
                                throw new Error('Empty response received from server');
                            }
                            
                            var jsonResponse = JSON.parse(response.responseText);
                            if (jsonResponse.error) {
                                consoleError('API error: ' + jsonResponse.error);
                                self._handleApiError(jsonResponse.error);
                            } else if (jsonResponse.content) {
                                consoleLog('API response processed successfully', {
                                    responseLength: jsonResponse.content ? jsonResponse.content.length : 0
                                });
                                self._insertContent(jsonResponse.content);
                            } else {
                                consoleError('API response missing content');
                                self._handleApiError('API response missing content');
                            }
                        } catch (e) {
                            consoleError('Error parsing API response', e);
                            console.log('Response text sample:', response ? safeSubstring(response.responseText, 0, 500) : 'none');
                            self._handleApiError('Error processing API response: ' + e.message);
                        }
                    },
                    failure: function(id, response) {
                        consoleError('API request failed', {
                            responseExists: !!response,
                            status: response ? response.status : 'unknown',
                            statusText: response ? response.statusText : 'unknown'
                        });
                        self._handleApiError('API request failed: ' + (response && response.statusText ? response.statusText : 'Unknown error'));
                    }
                }
            });
        } catch (e) {
            consoleError('Critical error in _callOpenAI', e);
            this._handleApiError('Critical error in API call: ' + e.message);
        }
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
        content = content + ' <img src="' + aiAssistantIconUrl + '" alt="AI-generated content" title="This content was generated by AI" class="ai-assisted-content-badge" style="width: 80px; height: 20px; vertical-align: middle; margin-left: 5px;" />';
        
        if (DEBUG) {
            console.log(LOGNAME + ': Content prepared for insertion with AI icon, length: ' + content.length);
        }

        // Make sure any dialog is hidden first to prevent focus issues
        this.getDialogue({focusAfterHide: false}).hide();
        
        // Focus the editor
        host.focus();

        // For add content mode, simply insert at focus point
        if (addContent) {
            try {
                host.insertContentAtFocusPoint(content);
                if (DEBUG) {
                    console.log(LOGNAME + ': Content added at cursor position');
                }
                this.markUpdated();
                return;
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Error adding content at focus point', e);
                }
            }
        } else {
            // For replace mode, use a multi-layered approach to ensure content is replaced
            
            // Try using the editor's setHTML method if available
            try {
                if (host.editor && typeof host.editor.setHTML === 'function') {
                    host.editor.setHTML(content);
                    
                    // Also update the textarea directly to ensure changes persist
                    if (host.textarea && typeof host.textarea.set === 'function') {
                        host.textarea.set('value', content);
                        if (DEBUG) {
                            console.log(LOGNAME + ': Updated textarea value after setHTML');
                        }
                    }
                    
                    // Update the original to apply changes
                    host.updateOriginal();
                    
                    if (DEBUG) {
                        console.log(LOGNAME + ': Replaced content using editor.setHTML()');
                    }
                    this.markUpdated();
                    return;
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Failed to use editor.setHTML()', e);
                }
            }
            
            // Try setting content via the editor's set method
            try {
                if (host.editor && typeof host.editor.set === 'function') {
                    host.editor.set('content', content);
                    
                    // Also update the textarea directly to ensure changes persist
                    if (host.textarea && typeof host.textarea.set === 'function') {
                        host.textarea.set('value', content);
                        if (DEBUG) {
                            console.log(LOGNAME + ': Updated textarea value after editor.set');
                        }
                    }
                    
                    // Update the original to apply changes
                    host.updateOriginal();
                    
                    if (DEBUG) {
                        console.log(LOGNAME + ': Replaced content using editor.set(content)');
                    }
                    this.markUpdated();
                    return;
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Failed to use editor.set(content)', e);
                }
            }
            
            // Try updating content via YUI Node API
            try {
                var editorId = host.get('elementid');
                if (Y.one && typeof Y.one === 'function') {
                    var editorArea = Y.one('#' + editorId + 'editable');
                    if (editorArea) {
                        editorArea.set('innerHTML', content);
                        
                        // Also update the textarea
                        var textArea = Y.one('#' + editorId);
                        if (textArea) {
                            textArea.set('value', content);
                        }
                        
                        // Update original
                        host.updateOriginal();
                        
                        if (DEBUG) {
                            console.log(LOGNAME + ': Replaced content using Y.one() for both editor and textarea');
                        }
                        this.markUpdated();
                        return;
                    }
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Failed to use Y.one() replacement', e);
                }
            }

            // Try to get selection and replace it with the new content
            try {
                // When all else fails, first try to select all content in the editor
                host.focus();
                
                // Use the browser's native selection API
                if (window.getSelection && document.createRange) {
                    var selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        selection.removeAllRanges();
                    }
                    
                    var editorId = host.get('elementid');
                    var editorNode = document.getElementById(editorId + 'editable');
                    
                    if (editorNode) {
                        var range = document.createRange();
                        range.selectNodeContents(editorNode);
                        selection.addRange(range);
                        
                        // Use execCommand to insert the HTML
                        var result = document.execCommand('insertHTML', false, content);
                        
                        if (result) {
                            if (DEBUG) {
                                console.log(LOGNAME + ': Replaced content using selection+execCommand');
                            }
                            
                            // Update the original textarea
                            host.updateOriginal();
                            this.markUpdated();
                            return;
                        } else {
                            if (DEBUG) {
                                console.log(LOGNAME + ': execCommand returned false, trying alternative');
                            }
                        }
                    }
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Error using selection and execCommand', e);
                }
            }
            
            // Last resort: force update the editor's DOM element directly
            try {
                var editorId = host.get('elementid');
                
                // Update the editable div
                var editorNode = document.getElementById(editorId + 'editable');
                if (editorNode) {
                    editorNode.innerHTML = content;
                    
                    // Try to manually trigger input event
                    var inputEvent = new Event('input', {
                        bubbles: true,
                        cancelable: true,
                    });
                    editorNode.dispatchEvent(inputEvent);
                    
                    // Also update the textarea
                    var textareaNode = document.getElementById(editorId);
                    if (textareaNode) {
                        textareaNode.value = content;
                    }
                    
                    // Force editor to recognize the change
                    host.updateOriginal();
                    
                    if (DEBUG) {
                        console.log(LOGNAME + ': Force-updated editor and textarea DOM elements directly');
                    }
                    this.markUpdated();
                    return;
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Error directly updating DOM', e);
                }
            }
            
            // Ultra last resort: try the insertContentAtFocusPoint even in replace mode
            try {
                host.focus();
                host.insertContentAtFocusPoint(content);
                if (DEBUG) {
                    console.log(LOGNAME + ': Used insertContentAtFocusPoint as last resort for replace mode');
                }
                this.markUpdated();
                return;
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Failed even with insertContentAtFocusPoint fallback', e);
                }
            }
        }
        
        if (DEBUG) {
            console.error(LOGNAME + ': All content insertion methods failed');
        }
    },

    /**
     * Get the current editor content using multiple methods
     * 
     * @method _getEditorContent
     * @private
     * @return {String} The editor content
     */
    _getEditorContent: function() {
        var host = this.get('host');
        var content = '';
        
        // Defensive check - if host is undefined, return empty string
        if (!host) {
            if (DEBUG) {
                console.error(LOGNAME + ': Host is undefined in _getEditorContent');
            }
            return '';
        }
        
        try {
            // Try multiple approaches to get the editor content
            
            // Method 1: Try the editor directly
            if (host.editor && typeof host.editor.get === 'function') {
                try {
                    content = host.editor.get('content');
                    if (content === undefined || content === null) {
                        if (DEBUG) {
                            console.warn(LOGNAME + ': editor.get(content) returned undefined/null');
                        }
                    } else {
                        if (DEBUG) {
                            console.log(LOGNAME + ': Got content using editor.get(content)');
                        }
                        return ensureString(content);
                    }
                } catch (e) {
                    if (DEBUG) {
                        console.error(LOGNAME + ': Failed to get content via editor.get(content)', e);
                    }
                }
            }
            
            // Method 2: Try the YUI instance
            if (Y && Y.one && typeof Y.one === 'function') {
                try {
                    var editorId = '';
                    try {
                        editorId = host.get('elementid');
                        if (!editorId) {
                            if (DEBUG) {
                                console.warn(LOGNAME + ': elementid is empty');
                            }
                            editorId = '';
                        }
                    } catch (e) {
                        if (DEBUG) {
                            console.error(LOGNAME + ': Error getting elementid', e);
                        }
                        editorId = '';
                    }
                    
                    if (editorId) {
                        var editorArea = Y.one('#' + editorId + 'editable');
                        if (editorArea) {
                            content = editorArea.get('innerHTML');
                            if (content === undefined || content === null) {
                                if (DEBUG) {
                                    console.warn(LOGNAME + ': Y.one().get(innerHTML) returned undefined/null');
                                }
                            } else {
                                if (DEBUG) {
                                    console.log(LOGNAME + ': Got content using Y.one().get(innerHTML)');
                                }
                                return ensureString(content);
                            }
                        } else {
                            if (DEBUG) {
                                console.warn(LOGNAME + ': Editor area not found: #' + editorId + 'editable');
                            }
                        }
                    }
                } catch (e) {
                    if (DEBUG) {
                        console.error(LOGNAME + ': Failed to get content via Y.one', e);
                    }
                }
            }
            
            // Method 3: Direct DOM access
            try {
                var editorId = '';
                try {
                    editorId = host.get('elementid');
                    if (!editorId) {
                        if (DEBUG) {
                            console.warn(LOGNAME + ': elementid is empty (DOM method)');
                        }
                    }
                } catch (e) {
                    if (DEBUG) {
                        console.error(LOGNAME + ': Error getting elementid (DOM method)', e);
                    }
                    editorId = '';
                }
                
                if (editorId) {
                    var editorNode = document.getElementById(editorId + 'editable');
                    if (editorNode) {
                        content = editorNode.innerHTML;
                        if (content === undefined || content === null) {
                            if (DEBUG) {
                                console.warn(LOGNAME + ': editorNode.innerHTML returned undefined/null');
                            }
                        } else {
                            if (DEBUG) {
                                console.log(LOGNAME + ': Got content using DOM getElementById');
                            }
                            return ensureString(content);
                        }
                    } else {
                        if (DEBUG) {
                            console.warn(LOGNAME + ': Editor node not found: ' + editorId + 'editable');
                        }
                    }
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Failed to get content via DOM', e);
                }
            }
            
            // Method 4: Try textarea value (fallback)
            try {
                var editorId = '';
                try {
                    editorId = host.get('elementid');
                    if (!editorId) {
                        if (DEBUG) {
                            console.warn(LOGNAME + ': elementid is empty (textarea method)');
                        }
                    }
                } catch (e) {
                    if (DEBUG) {
                        console.error(LOGNAME + ': Error getting elementid (textarea method)', e);
                    }
                    editorId = '';
                }
                
                if (editorId) {
                    var textareaNode = document.getElementById(editorId);
                    if (textareaNode) {
                        content = textareaNode.value;
                        if (content === undefined || content === null) {
                            if (DEBUG) {
                                console.warn(LOGNAME + ': textareaNode.value returned undefined/null');
                            }
                        } else {
                            if (DEBUG) {
                                console.log(LOGNAME + ': Got content using textarea value');
                            }
                            return ensureString(content);
                        }
                    } else {
                        if (DEBUG) {
                            console.warn(LOGNAME + ': Textarea node not found: ' + editorId);
                        }
                    }
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Failed to get content via textarea', e);
                }
            }
            
            if (DEBUG) {
                console.warn(LOGNAME + ': All methods to get editor content failed, returning empty string');
            }
            return '';
        } catch (e) {
            if (DEBUG) {
                console.error(LOGNAME + ': Error in _getEditorContent', e);
            }
            return '';
        }
    },

    /**
     * Replace editor content using multiple fallbacks
     * 
     * @method _replaceEditorContent
     * @param {String} content The content to replace with
     * @private
     * @return {Boolean} True if content was replaced, false otherwise
     */
    _replaceEditorContent: function(content) {
        var host = this.get('host');
        
        try {
            // Method 1: Try the editor directly
            if (host.editor && typeof host.editor.set === 'function') {
                try {
                    host.editor.set('content', content);
                    // After setting content, update the textarea to ensure changes persist
                    if (host.textarea && host.textarea.set && typeof host.textarea.set === 'function') {
                        host.textarea.set('value', content);
                        if (DEBUG) {
                            console.log(LOGNAME + ': Updated textarea value after editor.set');
                        }
                    }
                    
                    // Make sure the changes are applied
                    host.updateOriginal();
                    
                    if (DEBUG) {
                        console.log(LOGNAME + ': Replaced content using editor.set(content)');
                    }
    return true;
                } catch (e) {
                    if (DEBUG) {
                        console.error(LOGNAME + ': Failed to replace content via editor.set(content)', e);
                    }
                }
            }
            
            // Method 2: Try YUI node and update original
            if (Y.one && typeof Y.one === 'function') {
                try {
                    var editorId = host.get('elementid');
                    var editorArea = Y.one('#' + editorId + 'editable');
                    if (editorArea) {
                        editorArea.set('innerHTML', content);
                        // Update the original textarea
                        host.updateOriginal();
                        if (DEBUG) {
                            console.log(LOGNAME + ': Replaced content using Y.one().set(innerHTML) and updateOriginal');
                        }
                        return true;
                    }
                } catch (e) {
                    if (DEBUG) {
                        console.error(LOGNAME + ': Failed to replace content via Y.one', e);
                    }
                }
            }
            
            // Method 3: Direct DOM access and manual event
            try {
                var editorId = host.get('elementid');
                var editorNode = document.getElementById(editorId + 'editable');
                if (editorNode) {
                    editorNode.innerHTML = content;
                    
                    // Manually trigger an input event to ensure changes are recognized
                    var inputEvent = new Event('input', {
                        bubbles: true,
                        cancelable: true,
                    });
                    editorNode.dispatchEvent(inputEvent);
                    
                    // Update the original textarea
                    host.updateOriginal();
                    
                    if (DEBUG) {
                        console.log(LOGNAME + ': Replaced content using DOM getElementById and triggered input event');
                    }
                    return true;
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Failed to replace content via DOM', e);
                }
            }
            
            // Method 4: Try changing textarea value directly and notify editor
            try {
                var textareaNode = document.getElementById(host.get('elementid'));
                if (textareaNode) {
                    textareaNode.value = content;
                    
                    // Try to notify editor of change
                    if (host.editor && typeof host.editor.setHTML === 'function') {
                        host.editor.setHTML(content);
                    }
                    
                    if (DEBUG) {
                        console.log(LOGNAME + ': Replaced content using textarea value and notified editor');
                    }
                    return true;
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Failed to replace content via textarea', e);
                }
            }
            
            // Method 5 (Ultimate fallback): Use execCommand to replace selection
            try {
                host.focus();
                if (host.getSelection()) {
                    // Set selection to entire editor if possible
                    var selection = host.getSelection();
                    var range = document.createRange();
                    var editorId = host.get('elementid');
                    var editorNode = document.getElementById(editorId + 'editable');
                    
                    if (editorNode) {
                        range.selectNodeContents(editorNode);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        
                        // Use execCommand to replace content
                        document.execCommand('insertHTML', false, content);
                        if (DEBUG) {
                            console.log(LOGNAME + ': Replaced content using selection and execCommand');
                        }
                        return true;
                    }
                }
            } catch (e) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Failed to replace content via execCommand', e);
                }
            }
            
            if (DEBUG) {
                console.warn(LOGNAME + ': All methods to replace editor content failed');
            }
            return false;
        } catch (e) {
            if (DEBUG) {
                console.error(LOGNAME + ': Error in _replaceEditorContent', e);
            }
            return false;
        }
    }
});

}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin", "moodle-core-notification-dialogue", "io-base", "json-parse"]}); 