// Test E2E robusto para CartPage con Cypress

/// <reference types="cypress" />


// Helper para loguear como cliente
function loginCliente() {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type('maria.rodriguez@email.com');
  cy.get('[data-testid="password-input"]').type('password123');
  cy.get('[data-testid="login-button"]').click();
}

// Helper para preparar el carrito con al menos un producto
function prepararCarritoConProducto() {
  loginCliente();
  cy.visit('/productos');
  cy.get('[data-testid="add-to-cart-button"]').first().click();
  cy.visit('/cart');
}

describe('Cart Page E2E', () => {
  beforeEach(() => {
    // Loguear como cliente antes de cada test
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('maria.rodriguez@email.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.wait(500);
    // Inicializar el carrito en localStorage con un producto de ejemplo
    cy.window().then((win) => {
      win.localStorage.setItem('carrito', JSON.stringify([
        {
          _id: 'test-product-id',
          name: 'Producto Test',
          price: 10.99,
          quantity: 1,
          category: 'Test',
          image: '/assets/no-image.png'
        }
      ]));
    });
    cy.visit('/carrito');
    cy.wait(500);
    // Limpiar el carrito antes de cada test (opcional, si tienes botón o endpoint)
    // cy.clearLocalStorage('carrito');
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
    cy.wait(5000); // Espera adicional para la redirección
    cy.url().then((url) => {
      if (url.includes('/login')) {
        cy.get('[data-testid="email-input"]').type('maria.rodriguez@email.com');
        cy.get('[data-testid="password-input"]').type('password123');
        cy.get('[data-testid="login-button"]').click();
        cy.wait(3000); // Espera adicional tras login
      }
    });
    cy.wait(3000); // Espera final para asegurar la redirección
    cy.url().should('include', '/orders/success');
    cy.contains('¡Gracias por tu compra!').should('be.visible');
  });
});
