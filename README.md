# SMELLSPHISHY Browser Extension

This browser extension provides automatic and manual URL detection to identify phishing and benign URLs, protecting users as they browse. The detection mechanism is based on a Random Forest model adversarially trained using benign, phishing, and synthetic URLs generated with genetic algorithm.

## Features

- **Automatic Detection**: Automatically checks each URL you visit when activated, alerting you of phishing URLs.
- **Manual Detection**: Allows users to manually input a URL to verify its safety, useful for checking links before clicking.
- **Privacy-Focused**: No URLs are collected by the researcher. Blocked and allowed URL lists are stored only in the browser’s local storage, keeping your data private and secure.

## Getting Started

1. **Download the Repository**: Clone or download the repository to your local machine.
2. **Open Chrome Extensions Page**:
   - Open `chrome://extensions/` in your browser.
   - Enable **Developer mode** (toggle in the top right).
3. **Load the Extension**:
   - Click **Load unpacked** and select the downloaded repository folder. The extension will now appear in your extensions list.
4. **Activate the Extension**: Pin the extension to easily access it and enable detection features.

## Usage

### Automatic Detection

1. Enable automatic detection within the extension settings.
2. When on, every URL you navigate to will be automatically checked.
3. Alerts will notify you of phishing URLs.

### Manual Detection

1. Open the extension and use the input field to enter a URL.
2. The extension will check if the URL is benign or phishing.

## Model Information

- **Machine Learning Model**: Random Forest.
- **Training Method**: Adversarially trained using synthetic URLs created with a genetic algorithm. This training enhances the model’s accuracy against a wide range of phishing tactics.

## Storage

The extension stores two lists locally in your browser:
- **Blocked URLs**: List of detected phishing URLs.
- **Allowed URLs**: List of confirmed benign URLs and whitelisted URLs.

These lists are saved in your browser’s local storage and are not accessible to external parties or the developer.

---

This extension offers a balance between proactive protection and user privacy, giving you control over URL safety while preserving your data's confidentiality.
