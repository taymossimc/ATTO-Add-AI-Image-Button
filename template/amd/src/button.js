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
 * Atto template plugin
 *
 * @package    atto_template
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_template-button
 */
define([
    'jquery',
    'core/templates',
    'core/notification',
    'core/ajax',
    'core/modal_factory',
    'core/modal_events'
], function($, Templates, Notification, Ajax, ModalFactory, ModalEvents) {
    
    /**
     * Atto template insert plugin.
     *
     * @namespace M.atto_template
     * @class Button
     * @extends M.editor_atto.EditorPlugin
     */
    return {
        /**
         * Initialize the dialogue
         *
         * @method initializer
         */
        initializer: function() {
            // Add the template button to the toolbar
            this.addButton({
                buttonName: 'template',
                icon: 'ed/template',
                iconComponent: 'atto_template',
                callback: this._displayDialogue
            });
        },

        /**
         * Display the template selection dialogue
         *
         * @method _displayDialogue
         * @private
         */
        _displayDialogue: function() {
            // Define the options for the modal dialog
            var dialogTitle = M.util.get_string('dialogtitle', 'atto_template');
            var insertButton = M.util.get_string('insertemplate', 'atto_template');
            var cancelButton = M.util.get_string('cancel', 'atto_template');

            // Create the modal instance
            ModalFactory.create({
                type: ModalFactory.types.SAVE_CANCEL,
                title: dialogTitle,
                body: this._getTilesTemplate(),
                preShowCallback: function(modal) {
                    // Set up a click listener on the template tiles
                    var tiles = modal.getBodyNode().find('.template-tile');
                    tiles.on('click', function() {
                        // Remove 'selected' class from all tiles
                        tiles.removeClass('selected');
                        // Add 'selected' class to the clicked tile
                        $(this).addClass('selected');
                    });
                }
            })
            .then(function(modal) {
                // Register 'cancel' and 'save' event handlers
                modal.getRoot().on(ModalEvents.cancel, function() {
                    modal.destroy();
                });

                modal.getRoot().on(ModalEvents.save, function(e) {
                    e.preventDefault();
                    // Get the selected tile
                    var selectedTile = modal.getBodyNode().find('.template-tile.selected');
                    if (selectedTile.length === 0) {
                        // No tile selected
                        Notification.alert(
                            M.util.get_string('dialogtitle', 'atto_template'),
                            M.util.get_string('selectatemplate', 'atto_template')
                        );
                        return;
                    }

                    // Get the template type from the data attribute
                    var templateType = selectedTile.data('template');
                    
                    // Insert the appropriate template
                    if (templateType === 'tiles') {
                        this._insertTemplate(
                            this._getTilesTemplate()
                        );
                    }
                    
                    // Close the modal
                    modal.destroy();
                }.bind(this));

                // Show the modal
                modal.show();
            }.bind(this))
            .catch(Notification.exception);
        },

        /**
         * Insert the selected template into the editor content
         *
         * @method _insertTemplate
         * @param {string} template The HTML template to insert
         * @private
         */
        _insertTemplate: function(template) {
            this.get('host').insertContentAtFocusPoint(template);
            this.markUpdated();
        },

        /**
         * Returns the HTML for the tiles template
         *
         * @method _getTilesTemplate
         * @return {string} The HTML for the tiles template
         * @private
         */
        _getTilesTemplate: function() {
            // Template selection interface
            var templateHtml = '<div class="template-selection">' +
                '<div class="template-tile" data-template="tiles">' +
                    '<h4>Tiles Template</h4>' +
                    '<p>Responsive card layout with multiple modules</p>' +
                '</div>' +
            '</div>';

            // Actual template HTML that will be inserted
            var tilesHtml = 
            '<div class="tiles-container">' +
                '<div class="tile-row">' +
                    '<div class="tile-module">' +
                        '<div class="tile-icon"><i class="fa fa-book"></i></div>' +
                        '<div class="tile-content">' +
                            '<h3>Module Title 1</h3>' +
                            '<p>Enter a brief description of the module here.</p>' +
                            '<a href="#" class="tile-link">Learn more</a>' +
                        '</div>' +
                    '</div>' +
                    '<div class="tile-module">' +
                        '<div class="tile-icon"><i class="fa fa-video-camera"></i></div>' +
                        '<div class="tile-content">' +
                            '<h3>Module Title 2</h3>' +
                            '<p>Enter a brief description of the module here.</p>' +
                            '<a href="#" class="tile-link">Learn more</a>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="tile-row">' +
                    '<div class="tile-module">' +
                        '<div class="tile-icon"><i class="fa fa-comments"></i></div>' +
                        '<div class="tile-content">' +
                            '<h3>Module Title 3</h3>' +
                            '<p>Enter a brief description of the module here.</p>' +
                            '<a href="#" class="tile-link">Learn more</a>' +
                        '</div>' +
                    '</div>' +
                    '<div class="tile-module">' +
                        '<div class="tile-icon"><i class="fa fa-users"></i></div>' +
                        '<div class="tile-content">' +
                            '<h3>Module Title 4</h3>' +
                            '<p>Enter a brief description of the module here.</p>' +
                            '<a href="#" class="tile-link">Learn more</a>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

            return templateHtml;
        }
    };
}); 