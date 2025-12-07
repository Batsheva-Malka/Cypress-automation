// cypress.config.js - Updated configuration
const { defineConfig } = require("cypress");
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // Add tasks for Excel file operations
            on('task', {
                ensureDir(dirPath) {
                    if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath, { recursive: true });
                    }
                    return null;
                },
                writeFile({ filePath, data }) {
                    fs.writeFileSync(filePath, Buffer.from(data));
                    return null;
                }
            });
        },
        baseUrl: 'https://www.bose.com',
        viewportWidth: 1280,
        viewportHeight: 720,
        defaultCommandTimeout: 10000,
        pageLoadTimeout: 50000,
        video: true,
        screenshotOnRunFailure: true,
        screenshotsFolder: 'cypress/screenshots',
        videosFolder: 'cypress/videos',
        supportFile: 'cypress/support/e2e.js'
    },
});