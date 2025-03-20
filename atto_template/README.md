# Atto Template Plugin for Moodle

This plugin adds a button to the Atto editor that allows users to insert pre-defined HTML templates into the content area.

## Features

- Adds a template button to the Atto editor toolbar
- Provides a dialog to select from available templates
- Includes a responsive "Tiles" template with cards layout

## Installation

1. Copy the `atto_template` folder to the `lib/editor/atto/plugins` directory in your Moodle installation.
2. Visit the notifications page (Site administration > Notifications) to complete the installation.
3. Go to Site administration > Plugins > Text editors > Atto toolbar settings.
4. Add 'template' to one of the groups in the Toolbar config, for example:
   ```
   style1 = title, bold, italic, template
   ```

## Usage

1. Click on the template button in the Atto editor.
2. Select the desired template from the dialog.
3. Click "Insert template" to add the template to your content.

## Adding More Templates

To add more templates:

1. Create a new HTML template file in the `templates` directory.
2. Update the language strings in `lang/en/atto_template.php`.
3. Modify the JavaScript in `yui/src/button/js/button.js` to include the new template.
4. Run YUI Shifter to compile the JavaScript.

## Requirements

- Moodle 4.0 or later

## License

This plugin is licensed under the GNU GPL v3 or later. 