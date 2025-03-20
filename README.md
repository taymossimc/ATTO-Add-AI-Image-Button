# ATTO Template Button Plugin for Moodle

A Moodle ATTO editor plugin that adds a button to insert pre-written HTML templates into the editor content.

![Template Button in ATTO Editor](screenshots/template-button.jpg)

## Overview

This plugin extends the ATTO WYSIWYG editor in Moodle to allow users to quickly insert predefined HTML templates with a single click. The initial version includes a responsive card-based "Tiles" template, perfect for creating structured content layouts.

## Features

- Adds a template insertion button to the ATTO editor toolbar
- Clean, user-friendly dialog for template selection
- Initial "Tiles" template with responsive card layout grid
- Mobile-friendly design
- Easy to extend with additional templates

## Installation

1. Download the plugin files.
2. Create a folder named `atto_template` in your Moodle installation under `lib/editor/atto/plugins/`.
3. Copy all the plugin files into this directory.
4. Log in to your Moodle site as an administrator.
5. Go to Site Administration > Notifications to complete the installation.
6. Go to Site Administration > Plugins > Text Editors > Atto Toolbar Settings.
7. Add 'template' to one of the groups in the Toolbar config, for example:
   ```
   style1 = title, bold, italic, template
   ```

## Usage

1. Edit any content using the ATTO editor.
2. Click on the template button in the toolbar.
3. Select the desired template from the dialog.
4. Click "Insert template" to add the template to your content.
5. Edit the inserted template content as needed.

## Adding New Templates

You can easily extend this plugin with additional templates:

1. Add a new HTML template file in the `templates` directory.
2. Add corresponding language strings to `lang/en/atto_template.php`.
3. Update the JavaScript in `yui/src/button/js/button.js` to include your new template.
4. Run YUI Shifter to compile the JavaScript.

## Requirements

- Moodle 4.0 or later
- ATTO editor enabled

## License

This plugin is licensed under the GNU GPL v3 or later.

## Credits

Developed for CHURCHx to enhance content creation capabilities.

## Support

For bug reports or feature requests, please use the GitHub issues system. 