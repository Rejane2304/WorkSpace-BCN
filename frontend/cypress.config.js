const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Cambia el puerto si tu app usa otro
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.js'
  }
});
