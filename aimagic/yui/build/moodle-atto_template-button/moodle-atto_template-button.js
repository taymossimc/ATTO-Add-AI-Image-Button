YUI.add('moodle-atto_template-button', function (Y, NAME) {

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
 * Atto template insert button - YUI file
 *
 * @package    atto_template
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_template-button
 */

/**
 * Atto text editor template plugin.
 *
 * @namespace M.atto_template
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

var COMPONENTNAME = 'atto_template',
    LOGNAME = 'atto_template',
    TEMPLATES = {
        TILES: 'tiles',
        OUTCOMES: 'outcomes'
    },
    TEMPLATE_NAMES = {
        'tiles': 'tiles',
        'outcomes': 'outcomes'
    },
    CSS = {
        INPUTSUBMIT: 'atto_template_submit',
        INPUTCANCEL: 'atto_template_cancel',
        TEMPLATENAME: 'atto_template_name'
    },
    SELECTORS = {
        TEMPLATES: '.atto_template_option'
    };

Y.namespace('M.atto_template').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
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
     * Templates data cached from the server.
     * 
     * @property _templates
     * @type Object
     * @private
     */
    _templates: null,

    initializer: function() {
        // Add the template button first.
        this.addButton({
            icon: 'e/template',
            iconComponent: 'core',
            buttonName: 'template',  // This must match what's in the toolbar config
            callback: this._displayDialogue,
            title: 'insertemplate'
        });
        
        // Load templates from server when initializing.
        this._loadTemplates();
    },
    
    /**
     * Load templates data from server.
     * 
     * @method _loadTemplates
     * @private
     */
    _loadTemplates: function() {
        this._templates = {
            'tiles': M.cfg.wwwroot + '/lib/editor/atto/plugins/template/templates/tiles.html',
            'outcomes': M.cfg.wwwroot + '/lib/editor/atto/plugins/template/templates/outcomes.html'
        };
    },

    /**
     * Display the template selection dialogue.
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
            width: '800px',
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
            '<div class="atto_template_selector">' +
                '<div>' +
                    '<div class="atto_template_option" data-template="{{TILES}}">' +
                        '<div class="atto_template_name">{{tilestemplate}}</div>' +
                    '</div>' +
                    '<div class="atto_template_option" data-template="{{OUTCOMES}}">' +
                        '<div class="atto_template_name">Outcomes Template</div>' +
                    '</div>' +
                '</div>' +
                '<div class="mdl-align">' +
                    '<br/>' +
                    '<button class="{{CSS.INPUTSUBMIT}}">{{insertbutton}}</button>' +
                    ' ' +
                    '<button class="{{CSS.INPUTCANCEL}}">{{cancel}}</button>' +
                '</div>' +
            '</div>'
        );

        var content = Y.Node.create(template({
            CSS: CSS,
            TILES: TEMPLATES.TILES,
            OUTCOMES: TEMPLATES.OUTCOMES,
            tilestemplate: M.util.get_string('tilestemplate', COMPONENTNAME),
            insertbutton: M.util.get_string('insertemplate', COMPONENTNAME),
            cancel: M.util.get_string('cancel', COMPONENTNAME)
        }));

        // Handle template selection.
        content.all(SELECTORS.TEMPLATES).each(function(node) {
            node.on('click', function(e) {
                e.preventDefault();
                content.all(SELECTORS.TEMPLATES).removeClass('selected');
                node.addClass('selected');
            }, this);
        }, this);

        // Handle insert button.
        content.one('.' + CSS.INPUTSUBMIT).on('click', function(e) {
            e.preventDefault();
            var templateName = content.one(SELECTORS.TEMPLATES + '.selected').getData('template');
            this._insertTemplate(templateName);
            this.getDialogue({
                focusAfterHide: null
            }).hide();
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
     * Insert the selected template into the editor.
     *
     * @method _insertTemplate
     * @param {String} templateName
     * @private
     */
    _insertTemplate: function(templateName) {
        var templateContent = '';

        // Get the correct template content based on the selected template.
        if (templateName === TEMPLATES.TILES) {
            templateContent = this._getTilesTemplate();
        } else if (templateName === TEMPLATES.OUTCOMES) {
            templateContent = this._getOutcomesTemplate();
        }

        // Set the selection and insert the template content.
        this.get('host').setSelection(this._currentSelection);
        this.get('host').insertContentAtFocusPoint(templateContent);
        this.markUpdated();
    },

    /**
     * Returns the tiles template content.
     *
     * @method _getTilesTemplate
     * @private
     * @return {String} The template content
     */
    _getTilesTemplate: function() {
        return '<h3>Overview</h3>\n' +
               '<div class="block-theme-widget container">\n' +
               '    <div class="theme-cards row">\n' +
               '        <div class="col-6 col-lg-4 mb-4">\n' +
               '            <div class="card card-bg-light">\n' +
               '                <img src="https://churchx.ca/draftfile.php/94/user/draft/12957479/LIFT%20%2842%29.png" alt="" role="presentation" class="img-fluid">\n' +
               '                <div class="card-body">\n' +
               '                    <h5 class="card-title">Why Hybrid Worship?</h5>\n' +
               '                    <p class="card-text">A talk from Tay that gives the basic overview of the world of church and social media, looking into some basic theological considerations.</p>\n' +
               '                </div>\n' +
               '                <div class="card-footer">\n' +
               '                    <a href="#section-1" class="btn btn-secondary btn-block rounded">View Module</a>\n' +
               '                </div>\n' +
               '            </div>\n' +
               '        </div>\n' +
               '        <div class="col-6 col-lg-4 mb-4">\n' +
               '            <div class="card card-bg-light">\n' +
               '                <img src="https://churchx.ca/draftfile.php/94/user/draft/12957479/LIFT%20%2847%29.png" alt="" role="presentation" class="img-fluid">\n' +
               '                <div class="card-body">\n' +
               '                    <h5 class="card-title">The Basic Pieces of Hybrid Worship</h5>\n' +
               '                    <p class="card-text">A Hybrid Worship Glossary of important terms and concepts.&nbsp;</p>\n' +
               '                </div>\n' +
               '                <div class="card-footer">\n' +
               '                    <a href="#section-2" class="btn btn-secondary btn-block rounded">View Module</a>\n' +
               '                </div>\n' +
               '            </div>\n' +
               '        </div>\n' +
               '        <div class="col-6 col-lg-4 mb-4">\n' +
               '            <div class="card card-bg-light">\n' +
               '                <img src="https://churchx.ca/draftfile.php/94/user/draft/12957479/LIFT%20%2841%29.png" alt="" role="presentation" class="img-fluid">\n' +
               '                <div class="card-body">\n' +
               '                    <h5 class="card-title"></h5>\n' +
               '                    <h5>Methods of Providing Hybrid Worship</h5>\n' +
               '                    <p class="card-text">Three case studies that show different set-ups for livestreaming worship.&nbsp;</p>\n' +
               '                </div>\n' +
               '                <div class="card-footer">\n' +
               '                    <a href="#section-3" class="btn btn-secondary btn-block rounded">View Module</a>\n' +
               '                </div>\n' +
               '            </div>\n' +
               '        </div>\n' +
               '        <div class="col-6 col-lg-4 mb-4">\n' +
               '            <div class="card card-bg-light">\n' +
               '                <img src="https://churchx.ca/draftfile.php/94/user/draft/12957479/LIFT%20%2839%29.png" alt="" role="presentation" class="img-fluid">\n' +
               '                <div class="card-body">\n' +
               '                    <h5 class="card-title">Assessing Your Context</h5>\n' +
               '                    <p class="card-text">Three activities that will give you knowledge of the equipment, people, and procedures for you hybrid worship.</p>\n' +
               '                </div>\n' +
               '                <div class="card-footer">\n' +
               '                    <a href="#section-4" class="btn btn-secondary btn-block rounded">View Module</a>\n' +
               '                </div>\n' +
               '            </div>\n' +
               '        </div>\n' +
               '        <div class="col-6 col-lg-4 mb-4">\n' +
               '            <div class="card card-bg-light">\n' +
               '                <img src="https://3rdwavemedia.com/demo-images/slides/maker-module-3.jpg" alt="image">\n' +
               '                <div class="card-body">\n' +
               '                    <h5 class="card-title">Designing for Resiliency</h5>\n' +
               '                    <p class="card-text">A talk from Tay answering how to design a resilient setup, with some extra problem solving strategies you can use.</p>\n' +
               '                </div>\n' +
               '                <div class="card-footer">\n' +
               '                    <a href="#section-5" class="btn btn-secondary btn-block rounded">View Module</a>\n' +
               '                </div>\n' +
               '            </div>\n' +
               '        </div>\n' +
               '        <div class="col-6 col-lg-4 mb-4">\n' +
               '            <div class="card card-bg-light">\n' +
               '                <img src="https://churchx.ca/draftfile.php/94/user/draft/12957479/LIFT%20%2846%29.png" alt="" role="presentation" class="img-fluid">\n' +
               '                <div class="card-body">\n' +
               '                    <h5 class="card-title">Putting it all together</h5>\n' +
               '                    <p class="card-text">Some useful tips that help during the troubleshooting process.</p>\n' +
               '                </div>\n' +
               '                <div class="card-footer">\n' +
               '                    <a href="#section-6" class="btn btn-secondary btn-block rounded">View Module</a>\n' +
               '                </div>\n' +
               '            </div>\n' +
               '        </div>\n' +
               '    </div>\n' +
               '</div>\n' +
               '<h3>Let\'s Get Started!</h3>';
    },
    
    /**
     * Returns the outcomes template content.
     *
     * @method _getOutcomesTemplate
     * @private
     * @return {String} The template content
     */
    _getOutcomesTemplate: function() {
        // This is a fallback in case the template file cannot be loaded
        return '<div class="outcomes-container">' +
               '    <h3>Learning Outcomes</h3>' +
               '    <div class="outcomes-list">' +
               '        <p>After completing this module, you will be able to:</p>' +
               '        <ul>' +
               '            <li>Outcome 1</li>' +
               '            <li>Outcome 2</li>' +
               '            <li>Outcome 3</li>' +
               '        </ul>' +
               '    </div>' +
               '</div>';
    }
});

}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin"]}); 