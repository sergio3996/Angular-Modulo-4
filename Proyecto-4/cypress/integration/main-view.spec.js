 
describe('ventana principal', () => {
    it('tiene encabezado correcto y en español por defecto', () => {
      cy.visit('http://localhost:4200');
      cy.contains('Agregue su Fruta favorita');
      cy.get('h1 b').should('contain', 'HOLA es');
    });
  });