const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './specs',

    timeout: 10000,

    expect: {
        timeout: 5000
    },

    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }]
    ],

    use: {
        baseURL: 'http://localhost:3001',
        extraHTTPHeaders: {
            'Content-Type': 'application/json'
        }
    }
});