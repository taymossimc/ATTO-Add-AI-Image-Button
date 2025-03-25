# Moodle Atto AI Image Generator

This is a plugin for the Moodle Atto editor that allows users to generate AI images using Stability.ai's image generation API.

## Features

- Generate images directly within the Moodle editor
- Choose from square, landscape, or portrait aspect ratios
- Uses Stability.ai's API for high-quality image generation
- Images include AI watermark for transparency
- All image prompts are logged for accountability

## Requirements

- Moodle 3.8 or higher
- Stability.ai API key (obtain from https://platform.stability.ai/)
- PHP 7.3 or higher
- PHP GD extension for image manipulation
- PHP Imagick extension recommended for watermark support

## Installation

1. Download the plugin
2. Install it in the Moodle plugins directory: `/lib/editor/atto/plugins/aiimage`
3. Visit your Moodle site's notifications page to complete the installation
4. Go to Site Administration > Plugins > Text editors > Atto HTML editor > AI Image Generator to configure your API key

## Configuration

The plugin requires the following configuration:

1. **Stability AI API Key**: Your API key from Stability.ai
2. **Stability Model**: The model to use for image generation (e.g., Stable Diffusion XL)
3. **Base URL**: The API endpoint (default: https://api.stability.ai)
4. **Timeout**: Maximum time in seconds for API requests (default: 30)

## Usage

1. Place your cursor where you want to insert an image in the Atto editor
2. Click the AI Image Generator button in the Atto toolbar
3. Enter a description of the image you want to create
4. Select your preferred aspect ratio
5. Click "Generate"
6. The generated image will be inserted at the cursor position with an appropriate alt tag

## Privacy

This plugin logs the following information:
- User ID of who generated each image
- The text prompt used to generate the image
- Timestamp of when the image was generated

## License

This plugin is licensed under the GNU GPL v3 or later.

## Credits

- Developed by CHURCHx
- Icons and design elements by various artists
- Powered by Stability.ai API

## Support

For support, please open an issue on the plugin's GitHub page. 