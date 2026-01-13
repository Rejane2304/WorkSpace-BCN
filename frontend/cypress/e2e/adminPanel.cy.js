/// <reference types="cypress" />

describe('Admin Panel E2E', () => {
  const adminEmail = 'admin@workspacebcn.com';
  const adminPassword = 'admin123';

  it('puede loguearse como admin y acceder al panel', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').contains('Iniciar Sesión').click();
    cy.url({ timeout: 10000 }).should('include', '/admin');
    cy.contains('Panel de Administración', { timeout: 10000, matchCase: false }).should('be.visible');
  });

  it('puede agregar un producto desde el panel admin', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').contains('Iniciar Sesión').click();
    cy.url({ timeout: 10000 }).should('include', '/admin');

    cy.contains('button, a', 'Añadir / Editar Producto').click();
    cy.url().should('include', '/admin/productos');
    cy.get('.productsadmin-btn-add, .productsadmin-btn-create').first().click();
    
    cy.get('.modal-content form').should('be.visible');
    cy.get('input[name="name"]').type('Producto Cypress Test');
    cy.get('textarea[name="description"]').type('Producto de prueba E2E');
    cy.get('input[type="number"][name="price"]').type('99.99');
    

    cy.contains('.form-group', 'Categoría').within(() => {
      cy.get('.select-custom-control').click();
    });

    cy.get('.select-custom-menu .select-custom-option').contains('Informática').click();
    cy.get('input[type="number"][name="stock"]').type('10');
    cy.get('input[type="number"][name="minStock"]').type('2');
    cy.get('input[type="number"][name="maxStock"]').type('20');
    cy.get('.modal-content form button.btn-primary').contains(/crear|actualizar/i).should('be.visible').click();
    cy.contains('Producto Cypress Test').should('be.visible');
  });

  it('puede registrar movimiento de inventario', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').contains('Iniciar Sesión').click();
    cy.url({ timeout: 10000 }).should('include', '/admin');
    
    cy.contains('button, a', 'Controlar Stock').click();
    cy.url().should('include', '/admin/inventario');
    cy.get('input[placeholder="Buscar productos..."]').type('Producto Cypress Test');
    cy.contains('td', 'Producto Cypress Test').parent('tr').within(() => {
      cy.get('button.btn-inventory-in').click();
    });

    cy.contains('Movimiento de inventario registrado correctamente.', { timeout: 10000 }).should('be.visible');
  });
});
