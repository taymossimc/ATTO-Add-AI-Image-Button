# ATTO AI Magic Plugin for Moodle

This plugin adds an AI-powered content generation button to Moodle's ATTO text editor, allowing users to create or enhance content using OpenAI's Agents API.

## Features

- Integrates with OpenAI's Agents API for intelligent content generation
- Provides a simple interface to request AI-generated content
- Can work with existing content to enhance, reformat, or expand it
- Inserts HTML with appropriate styling directly into the editor

## Requirements

- Moodle 4.0 or higher
- OpenAI API Key with access to the Agents API
- OpenAI Agent ID for the specific agent you want to use

## Installation

1. Download the plugin
2. Extract the folder and rename it to "aimagic"
3. Place the folder in your Moodle installation under `/lib/editor/atto/plugins/`
4. Visit the site administration notifications page to complete the installation

## Configuration

1. Go to Site Administration > Plugins > Text editors > Atto HTML editor > AI Magic
2. Enter your OpenAI API Key
3. Enter your OpenAI Agent ID
4. Adjust other settings as needed

## Usage

1. Click on the magic wand icon in the ATTO editor toolbar
2. Type your request in the prompt field
3. Click "Generate Content"
4. The AI-generated content will be inserted at the cursor position or replace selected text

## License

This plugin is licensed under the [GNU GPL v3 or later](http://www.gnu.org/copyleft/gpl.html)

## Credits

Developed by Tay Moss for CHURCHx (2025) imc@tucc.ca