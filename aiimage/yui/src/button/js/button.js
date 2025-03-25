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
 * Atto AI Image insert button - YUI file
 *
 * @package    atto_aiimage
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_aiimage-button
 */

/**
 * Atto text editor AI Image plugin.
 *
 * @namespace M.atto_aiimage
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

var COMPONENTNAME = 'atto_aiimage',
    LOGNAME = 'atto_aiimage',
    CSS = {
        INPUTSUBMIT: 'atto_aiimage_submit',
        INPUTCANCEL: 'atto_aiimage_cancel',
        INPUTPROMPT: 'atto_aiimage_prompt',
        ASPSETRATIO_SQUARE: 'atto_aiimage_ratio_square',
        ASPSETRATIO_LANDSCAPE: 'atto_aiimage_ratio_landscape',
        ASPSETRATIO_PORTRAIT: 'atto_aiimage_ratio_portrait',
        PROCESSING: 'atto_aiimage_processing'
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

Y.namespace('M.atto_aiimage').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
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
     * Configuration settings for the Stability.ai API
     * 
     * @property _apiSettings
     * @type Object
     * @private
     */
    _apiSettings: null,

    /**
     * The form element containing our dialogue.
     * 
     * @property _form
     * @type Node
     * @private
     */
    _form: null,

    /**
     * The dialogue content container.
     * 
     * @property _content
     * @type Node
     * @private
     */
    _content: null,

    /**
     * Flag to prevent recursive insertion
     *
     * @property _isInserting
     * @type Boolean
     * @private
     */
    _isInserting: false,

    initializer: function() {
        // Debug initialization
        if (DEBUG) {
            console.log(LOGNAME + ': Initializing AI Image button');
        }
        
        // Set up the settings from either our attributes or the global M.atto_aiimage.settings object
        this._apiSettings = {
            hasapikey: false,
            model: '',
            baseurl: '',
            timeout: 30,
            contextid: 0
        };

        // First try to get settings from our attributes
        if (this.get('hasapikey') !== undefined) {
            this._apiSettings.hasapikey = this.get('hasapikey');
            this._apiSettings.model = this.get('model');
            this._apiSettings.baseurl = this.get('baseurl');
            this._apiSettings.timeout = this.get('timeout');
            this._apiSettings.contextid = this.get('contextid');
        } 
        // Then try to get settings from global M.atto_aiimage.settings object
        else if (M && M.atto_aiimage && M.atto_aiimage.settings) {
            this._apiSettings.hasapikey = M.atto_aiimage.settings.hasapikey;
            this._apiSettings.model = M.atto_aiimage.settings.model;
            this._apiSettings.baseurl = M.atto_aiimage.settings.baseurl;
            this._apiSettings.timeout = M.atto_aiimage.settings.timeout;
            this._apiSettings.contextid = M.atto_aiimage.settings.contextid;
        }
        
        // Debug settings
        if (DEBUG) {
            console.log(LOGNAME + ': Settings loaded', {
                hasapikey: this._apiSettings.hasapikey,
                model: this._apiSettings.model,
                baseurl: this._apiSettings.baseurl,
                timeout: this._apiSettings.timeout,
                contextid: this._apiSettings.contextid
            });
        }
        
        if (this._apiSettings.hasapikey) {
            // Add the button to the toolbar
            this.addButton({
                icon: 'icon',
                iconComponent: COMPONENTNAME,
                callback: this._displayDialogue,
                callbackArgs: {
                    customData: { component: COMPONENTNAME }
                },
                tags: 'img',
                tagMatchRequiresAll: false
            });
        } else {
            if (DEBUG) {
                console.log(LOGNAME + ': No API key configured, button not added to toolbar');
            }
        }
    },

    /**
     * Display the AI Image generator dialogue.
     *
     * @method _displayDialogue
     * @private
     */
    _displayDialogue: function() {
        if (DEBUG) {
            console.log(LOGNAME + ': Displaying dialogue');
        }
        
        // Save the current selection
        this._currentSelection = this.get('host').getSelection();
        
        if (this._currentSelection === false) {
            return;
        }
        
        // Create the dialogue
        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('dialogtitle', COMPONENTNAME),
            width: '650px',
            focusAfterHide: true,
            focusOnShowSelector: 'textarea.' + CSS.INPUTPROMPT
        });
        
        // Set the dialogue content
        this._content = this._getDialogueContent();
        dialogue.set('bodyContent', this._content);
        
        // Show the dialogue
        dialogue.show();
    },
    
    /**
     * Get the HTML content for the AI Image dialogue
     * 
     * @method _getDialogueContent
     * @return {Node} The dialogue content
     * @private
     */
    _getDialogueContent: function() {
        if (DEBUG) {
            console.log(LOGNAME + ': Building dialogue content');
        }

        // Define the dialogue content using handlebars
        var dialogueContent = '' +
            '<div class="' + CSS.PROCESSING + '" style="display:none">' +
                '<div class="mdl-align">' +
                    '<img src="{{gif}}" alt="" class="spinner" />' +
                    '<span class="processing-text">{{get_string "processing" component}}</span>' +
                '</div>' +
            '</div>' +
            '<form class="atto_form">' +
                '<div class="mb-3">' +
                    '<label for="{{elementid}}_' + CSS.INPUTPROMPT + '" class="form-label">{{get_string "promptlabel" component}}</label>' +
                    '<textarea class="form-control fullwidth ' + CSS.INPUTPROMPT + '" rows="5" ' +
                        'id="{{elementid}}_' + CSS.INPUTPROMPT + '" required></textarea>' +
                '</div>' +
                '<div class="mb-3">' +
                    '<label class="form-label">{{get_string "aspectratiolabel" component}}</label>' +
                    '<div class="form-check">' +
                        '<input class="form-check-input ' + CSS.ASPSETRATIO_SQUARE + '" type="radio" ' +
                            'name="aspectratio" id="{{elementid}}_' + CSS.ASPSETRATIO_SQUARE + '" value="square" checked>' +
                        '<label class="form-check-label" for="{{elementid}}_' + CSS.ASPSETRATIO_SQUARE + '">' +
                            '{{get_string "aspectratio_square" component}}' +
                        '</label>' +
                    '</div>' +
                    '<div class="form-check">' +
                        '<input class="form-check-input ' + CSS.ASPSETRATIO_LANDSCAPE + '" type="radio" ' +
                            'name="aspectratio" id="{{elementid}}_' + CSS.ASPSETRATIO_LANDSCAPE + '" value="landscape">' +
                        '<label class="form-check-label" for="{{elementid}}_' + CSS.ASPSETRATIO_LANDSCAPE + '">' +
                            '{{get_string "aspectratio_landscape" component}}' +
                        '</label>' +
                    '</div>' +
                    '<div class="form-check">' +
                        '<input class="form-check-input ' + CSS.ASPSETRATIO_PORTRAIT + '" type="radio" ' +
                            'name="aspectratio" id="{{elementid}}_' + CSS.ASPSETRATIO_PORTRAIT + '" value="portrait">' +
                        '<label class="form-check-label" for="{{elementid}}_' + CSS.ASPSETRATIO_PORTRAIT + '">' +
                            '{{get_string "aspectratio_portrait" component}}' +
                        '</label>' +
                    '</div>' +
                '</div>' +
                '<div class="mdl-align">' +
                    '<button class="btn btn-secondary ' + CSS.INPUTCANCEL + '">{{get_string "cancel" component}}</button>' +
                    '<button class="btn btn-primary ml-1 ' + CSS.INPUTSUBMIT + '">{{get_string "generatebutton" component}}</button>' +
                '</div>' +
            '</form>';

        // Compile the template with handlebars
        var template = Y.Handlebars.compile(dialogueContent);

        // Create the content from the template
        var content = Y.Node.create(template({
            component: COMPONENTNAME,
            elementid: this.get('host').get('elementid'),
            CSS: CSS,
            gif: M.util.image_url('i/loading', 'core'),
            get_string: M.util.get_string
        }));
        
        // Cache the form element for later use
        this._form = content.one('form');
        
        if (!this._form) {
            console.error(LOGNAME + ': Form element not created');
            return content;
        }
        
        // Verify processing element exists
        var processingElement = content.one('.' + CSS.PROCESSING);
        if (!processingElement && DEBUG) {
            console.error(LOGNAME + ': Processing element could not be created');
        }
        
        var submitButton = this._form.one('.' + CSS.INPUTSUBMIT);
        var cancelButton = this._form.one('.' + CSS.INPUTCANCEL);
        var promptTextarea = this._form.one('.' + CSS.INPUTPROMPT);
        
        // Debug form elements
        if (DEBUG) {
            console.log(LOGNAME + ': Form elements: ', {
                form: !!this._form,
                processingElement: !!processingElement,
                submitButton: !!submitButton,
                cancelButton: !!cancelButton,
                promptTextarea: !!promptTextarea
            });
        }
        
        // Set up the event handlers if elements exist
        if (submitButton) {
            submitButton.on('click', this._generateImage, this);
        }
        
        if (cancelButton) {
            cancelButton.on('click', this._cancel, this);
        }
        
        if (promptTextarea) {
            // Handle enter key in the prompt textarea
            promptTextarea.on('key', function(e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    return true;
                }
            }, 'press:13', this);
        }
        
        return content;
    },
    
    /**
     * Handle image generation
     *
     * @method _generateImage
     * @param {EventFacade} e Form submission event
     * @private
     */
    _generateImage: function(e) {
        e.preventDefault();
        
        if (DEBUG) {
            console.log(LOGNAME + ': Generate button clicked');
        }
        
        if (!this._form) {
            console.error(LOGNAME + ': Form not found');
            return;
        }
        
        // Disable the form while processing
        this._form.all('input, textarea, button').set('disabled', true);
        
        // Access the _content container directly to find the processing element
        if (!this._content) {
            console.error(LOGNAME + ': Content container not found');
            return;
        }
        
        // Show the processing spinner
        var processingElement = this._content.one('.' + CSS.PROCESSING);
        if (processingElement) {
            processingElement.setStyle('display', 'block');
            if (DEBUG) {
                console.log(LOGNAME + ': Processing element found and displayed');
            }
        } else if (DEBUG) {
            console.warn(LOGNAME + ': Processing element not found in content container');
        }
        
        // Get the prompt from the form
        var promptElement = this._form.one('.' + CSS.INPUTPROMPT);
        if (!promptElement) {
            if (DEBUG) {
                console.error(LOGNAME + ': Prompt textarea not found');
            }
            this._showError(M.util.get_string('error', COMPONENTNAME));
            return;
        }
        
        var prompt = promptElement.get('value').trim();
        
        // Get the aspect ratio
        var aspectRatio = 'square'; // Default
        var landscapeElement = this._form.one('.' + CSS.ASPSETRATIO_LANDSCAPE);
        var portraitElement = this._form.one('.' + CSS.ASPSETRATIO_PORTRAIT);
        
        if (landscapeElement && landscapeElement.get('checked')) {
            aspectRatio = 'landscape';
        } else if (portraitElement && portraitElement.get('checked')) {
            aspectRatio = 'portrait';
        }
        
        if (DEBUG) {
            console.log(LOGNAME + ': Generating image with prompt: ' + prompt);
            console.log(LOGNAME + ': Aspect ratio: ' + aspectRatio);
        }
        
        // Validation
        if (!prompt) {
            this._showError(M.util.get_string('error', COMPONENTNAME));
            return;
        }
        
        // Make AJAX request to server to generate image
        var url = M.cfg.wwwroot + '/lib/editor/atto/plugins/aiimage/ajax.php';
        var params = {
            action: 'generate',
            contextid: this._apiSettings.contextid,
            sesskey: M.cfg.sesskey,
            prompt: prompt,
            apikey: '', // API key will be handled by the server
            baseurl: this._apiSettings.baseurl,
            model: this._apiSettings.model,
            timeout: this._apiSettings.timeout,
            aspectratio: aspectRatio
        };
        
        if (DEBUG) {
            console.log(LOGNAME + ': Sending request to', url);
            console.log(LOGNAME + ': With parameters', {
                action: params.action,
                contextid: params.contextid,
                promptLength: params.prompt.length,
                model: params.model,
                aspectratio: params.aspectratio
            });
        }
        
        Y.io(url, {
            method: 'POST',
            data: params,
            on: {
                success: function(id, response) {
                    try {
                        var result = JSON.parse(response.responseText);
                        if (DEBUG) {
                            console.log(LOGNAME + ': API response', result);
                        }
                        
                        if (result.success) {
                            // Insert the image into the editor
                            this._insertImage(result.content);
                        } else {
                            // Show error
                            this._showError(result.error || M.util.get_string('error', COMPONENTNAME));
                        }
                    } catch (error) {
                        if (DEBUG) {
                            console.error(LOGNAME + ': Error parsing response', error);
                        }
                        this._showError(M.util.get_string('error', COMPONENTNAME));
                    }
                },
                failure: function() {
                    if (DEBUG) {
                        console.error(LOGNAME + ': API request failed');
                    }
                    this._showError(M.util.get_string('error', COMPONENTNAME));
                }
            },
            context: this
        });
    },
    
    /**
     * Insert the generated image into the editor
     *
     * @method _insertImage
     * @param {String} html The HTML to insert (img tag with all attributes)
     * @private
     */
    _insertImage: function(html) {
        if (DEBUG) {
            console.log(LOGNAME + ': Inserting image');
        }

        try {
            var host = this.get('host');
            if (!host) {
                throw new Error('Editor host not found');
            }

            if (DEBUG) {
                console.log(LOGNAME + ': HTML to insert:', html);
            }
            
            // Store dialogue for later use
            var dialogue = this.getDialogue();

            // Set a flag to break recursive calls
            if (this._isInserting) {
                if (DEBUG) {
                    console.warn(LOGNAME + ': Recursive insertion detected, aborting');
                }
                return;
            }
            this._isInserting = true;

            try {
                // Restore the selection to where it was when the dialogue was launched
                if (this._currentSelection) {
                    host.setSelection(this._currentSelection);
                    if (DEBUG) {
                        console.log(LOGNAME + ': Selection restored');
                    }
                }
                
                // Mark content as updated
                this.markUpdated();
                
                // Insert the content
                host.insertContentAtFocusPoint(html);
                
                if (DEBUG) {
                    console.log(LOGNAME + ': Content inserted successfully');
                }
            } catch (insertError) {
                if (DEBUG) {
                    console.error(LOGNAME + ': Error during content insertion:', insertError);
                }
                throw insertError;
            } finally {
                this._isInserting = false;
            }

            // Use a separate function to hide the dialogue
            // This separation helps avoid recursion issues
            var hideDialogue = function() {
                if (dialogue) {
                    dialogue.hide();
                    if (DEBUG) {
                        console.log(LOGNAME + ': Dialogue hidden');
                    }
                }
            };

            // Delay hiding the dialogue to prevent event conflicts
            setTimeout(hideDialogue, 100);
            
        } catch (e) {
            if (DEBUG) {
                console.error(LOGNAME + ': Failed to insert image:', e, 'Stack:', e.stack);
            }
            
            // Show error to user
            this._showError(M.util.get_string('error', COMPONENTNAME) + ' - ' + (e.message || 'Unknown error'));
            
            // Keep dialog open and enable form controls
            if (this._form) {
                this._form.all('input, textarea, button').set('disabled', false);
            }
            
            // Hide processing indicator
            var processingElement = this._content.one('.' + CSS.PROCESSING);
            if (processingElement) {
                processingElement.setStyle('display', 'none');
            }
            
            // Reset insertion flag in case of error
            this._isInserting = false;
        }
    },
    
    /**
     * Display an error message in the dialogue
     *
     * @method _showError
     * @param {String} errorMsg The error message to display
     * @private
     */
    _showError: function(errorMsg) {
        if (DEBUG) {
            console.error(LOGNAME + ': Error: ' + errorMsg);
        }
        
        // Hide the processing spinner
        var processingElement = this._content.one('.' + CSS.PROCESSING);
        if (processingElement) {
            processingElement.setStyle('display', 'none');
        }
        
        // Enable the form elements
        if (this._form) {
            this._form.all('input, textarea, button').set('disabled', false);
            
            // Create the error message container
            var error = Y.Node.create('<div class="alert alert-danger"></div>');
            error.set('text', errorMsg);
            
            // Add to form
            this._form.insertBefore(error, this._form.one('div'));
        }
    },
    
    /**
     * Cancel the AI Image dialogue
     *
     * @method _cancel
     * @param {EventFacade} e
     * @private
     */
    _cancel: function(e) {
        e.preventDefault();
        this.getDialogue().hide();
    }
}, {
    ATTRS: {
        /**
         * Whether an API key is configured
         *
         * @attribute hasapikey
         * @type Boolean
         * @default false
         */
        hasapikey: {
            value: false
        },
        
        /**
         * The Stability AI model to use
         *
         * @attribute model
         * @type String
         * @default ''
         */
        model: {
            value: ''
        },
        
        /**
         * The base URL for the Stability API
         *
         * @attribute baseurl
         * @type String
         * @default ''
         */
        baseurl: {
            value: ''
        },
        
        /**
         * Request timeout in seconds
         *
         * @attribute timeout
         * @type Number
         * @default 30
         */
        timeout: {
            value: 30
        },
        
        /**
         * The context ID
         *
         * @attribute contextid
         * @type Number
         * @default 0
         */
        contextid: {
            value: 0
        }
    }
}); 