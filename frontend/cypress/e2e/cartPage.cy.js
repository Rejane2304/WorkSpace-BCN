/// <reference types="cypress" />


function loginCliente() {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type('maria.rodriguez@email.com');
  cy.get('[data-testid="password-input"]').type('password123');
  cy.get('[data-testid="login-button"]').click();
}

function prepararCarritoConProducto() {
  loginCliente();
  cy.visit('/productos');
  cy.get('[data-testid="add-to-cart-button"]:not([disabled])').first().click();
  cy.visit('/cart');
}

describe('Cart Page E2E', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('maria.rodriguez@email.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.wait(500);
    
    cy.visit('/productos');
    cy.get('[data-testid="add-to-cart-button"]:not([disabled])').first().click();
    cy.visit('/carrito');
    cy.wait(500);
  });

  it('muestra el título del carrito', () => {
    cy.get('[data-testid="cart-title"]').should('be.visible');
  });

  it('muestra los botones de acción', () => {
    cy.get('[data-testid="empty-cart-button"]').should('exist');
    cy.get('[data-testid="pay-button"]').should('exist');
  });

  it('es responsive en mobile', () => {
    cy.viewport('iphone-x');
    cy.wait(500);
    cy.get('[data-testid="pay-button"]').should('be.visible');
  });

  it('es responsive en tablet', () => {
    cy.viewport(768, 1024);
    cy.wait(500);
    cy.get('[data-testid="pay-button"]').should('be.visible');
  });

  it('es responsive en desktop', () => {
    cy.viewport(1440, 900);
    cy.wait(500);
    cy.get('[data-testid="pay-button"]').should('be.visible');
  });

  it('vacía el carrito y muestra estado vacío', () => {
    cy.get('[data-testid="empty-cart-button"]').should('exist').click();
    cy.wait(500);
    cy.get('[data-testid="cart-empty-message"]').should('be.visible');
  });

  it('puede pagar si hay productos', () => {
    cy.get('[data-testid="pay-button"]').should('not.be.disabled').click();
    cy.url({ timeout: 10000 }).should('include', '/checkout');
    cy.get('input[aria-label="Nombre completo"]', { timeout: 5000 }).clear().type('María Rodríguez');
    cy.get('input[aria-label="Email"]', { timeout: 5000 }).clear().type('maria.rodriguez@email.com');
    cy.get('input[aria-label="Calle"]', { timeout: 5000 }).clear().type('Carrer del Mar 18');
    cy.get('input[aria-label="Ciudad"]', { timeout: 5000 }).clear().type('Barcelona');
    cy.get('input[aria-label="Código postal"]', { timeout: 5000 }).clear().type('08003');
    cy.get('input[aria-label="País"]', { timeout: 5000 }).clear().type('España');
    cy.get('input[aria-label="Teléfono"]', { timeout: 5000 }).clear().type('612345678');
    cy.get('[data-testid="confirm-order-button"]').should('not.be.disabled').click();
    cy.contains('¡Gracias por tu compra!', { timeout: 10000 }).should('be.visible');
  });
});
