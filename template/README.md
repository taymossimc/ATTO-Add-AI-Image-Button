# ATTO Template Button Plugin for Moodle

A Moodle ATTO editor plugin that adds a button to insert pre-written HTML templates into the editor content.

Note that these particular HTML snippets use CSS that is particular to the "Edutor" Theme by 3rdWaveMedia . https://elearning.3rdwavemedia.com/themes/moodle-theme-edutor/ .  This is a paid-theme for Moodle versions 4.x .  But you can easily modify this plugin to work with your own html snippets.  

And, yes, I know that ATTO is being replaced with TinyMC. And when our website switches over, I will redo this plugin for that editor.

This plugin was created by Tay Moss for https://churchx.ca website.

## Overview

This plugin extends the ATTO WYSIWYG editor in Moodle to allow users to quickly insert predefined HTML templates with a single click. 

## Features

- Adds a template insertion button to the ATTO editor toolbar
- Clean, user-friendly dialog for template selection
- Initial "Tiles" template with responsive card layout grid (Based on Edutor Theme)
- Mobile-friendly design
- Easy to extend with additional templates

## Installation

1. Download the plugin files.
2. Create a folder named `template` in your Moodle installation under `lib/editor/atto/plugins/`.
3. Copy all the plugin files into this directory.
4. Log in to your Moodle site as an administrator.
5. Go to Site Administration > Notifications to complete the installation.
6. Go to Site Administration > Plugins > Text Editors > Atto Toolbar Settings.
7. Add 'template' to one of the groups in the Toolbar config, for example:
   ```
   other = html, template
   ```

## Usage

1. Edit any content using the ATTO editor.
2. Click on the template button in the toolbar.
3. Select the desired template from the dialog.
4. Click "Insert template" to add the template to your content.
5. Edit the inserted template content as needed.

## Requirements

- Moodle 4.0 or later
- ATTO editor enabled

## License

This plugin is licensed under the GNU GPL v3 or later.

## Credits

Developed for CHURCHx to enhance content creation capabilities.

## Support

For bug reports or feature requests, please use the GitHub issues system. 