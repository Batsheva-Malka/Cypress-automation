// cypress/support/commands.js - Custom reusable commands
// ***********************************************
// Custom commands for Bose E-Commerce Testing
// ***********************************************

const XLSX = require('xlsx');
import path from 'path';

Cypress.Commands.add('selectCategory', (categoryName) => {
    cy.get('.secondary-navigation__button')
      .contains(categoryName, { matchCase: false })
      .click();
});

Cypress.Commands.add('addProductToCart', (productIndex = 0) => {
    cy.get('.product-tile-content')
      .eq(productIndex)
      .find('button.add-to-cart')
      .should('be.visible')
      .click();
});

Cypress.Commands.add('openCart', () => {
    cy.scrollTo('top');
    cy.get('.minicart-link').click();
    cy.get('.product-cart-wrapper.row').should('be.visible');
});

Cypress.Commands.add('increaseQuantity', (itemIndex = 0) => {
    cy.get('.product-cart-wrapper.row')
      .eq(itemIndex)
      .find('.quantity__counter-button.quantity__counter-plus')
      .click();
    cy.wait(1000); 
});

Cypress.Commands.add('getCartPrices', () => {
    const prices = [];
    return cy.get('.product-cart-wrapper.row').then($items => {
        $items.each((index, item) => {
            const priceText = Cypress.$(item).find('.pricing > p:nth-child(2)').text().trim();
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            prices.push(price);
        });
        return prices;
    });
});

Cypress.Commands.add('getCartQuantities', () => {
    const quantities = [];
    return cy.get('.product-cart-wrapper.row').then($items => {
        $items.each((index, item) => {
            const qtyText = Cypress.$(item).find('.quantity__counter-value').text().trim();
            quantities.push(parseInt(qtyText));
        });
        return quantities;
    });
});

Cypress.Commands.add('getTotalPrice', () => {
    return cy.get('.cart-total__value.cart-total--grand.estimated-total')
      .invoke('text')
      .then(text => parseFloat(text.replace(/[^0-9.]/g, '')));
});

Cypress.Commands.add('clickCheckout', () => {
    cy.get('.checkout__button').click();
});


Cypress.Commands.add('fillCheckoutForm', (userData) => {
    cy.get('#email').should('be.enabled');
    cy.get('#shippingFirstNamedefault').should('be.enabled');
    cy.get('#shippingLastNamedefault').should('be.enabled');
    
    if (userData.email) {
        cy.get('#email').clear().type(userData.email);
    }
    
    if (userData.firstName) {
        cy.get('#shippingFirstNamedefault').clear().type(userData.firstName);
    }
    
    if (userData.lastName) {
        cy.get('#shippingLastNamedefault').clear().type(userData.lastName);
    }
    
      if (userData.phone) {
        cy.get('#shippingPhoneNumberdefault').should('be.enabled').clear().type(userData.phone);
    }
    // if (userData.address) {
    //     cy.get('#shippingAddressOnedefault').should('be.enabled').clear({ force: true }).type(userData.address, { force: true });
        
        // cy.get('.edq-global-intuitive-address-suggestion', { timeout: 5000 })
        //   .should('be.visible')
        //   .contains('123 Main Street Anx')
        //   .click();
        
        // cy.wait(1000);
        
    // }
    if (userData.address) {
    cy.get('#shippingAddressOnedefault').should('be.enabled').clear({ force: true }).type(userData.address, { force: true });
    
    cy.get('.edq-global-intuitive-address-suggestion', { timeout: 5000 })
      .should('be.visible')
      .contains('123 Main Street Anx')
      .click();
    
    // Wait for autocomplete to fully populate all fields
   cy.wait(3000); // Increased from 2000ms
        
        // Verify the state was auto-filled
        cy.get('#shippingStatedefault').should('have.class', 'has-value');
        
        // Wait for any pending XHR requests to complete
        cy.wait(500);
}
    
    // if (userData.city) {
    //     cy.get('#shippingAddressCitydefault').should('be.enabled').clear({ force: true }).type(userData.city, { force: true });
    // }
    
    // if (userData.country) {
    //     cy.get('#shippingCountrydefault').should('be.enabled').select(userData.country, { force: true });
    //     cy.wait(500); // Wait for state dropdown to populate
    // }
    
    // if (userData.state) {
    //     cy.get('#shippingStatedefault').should('be.enabled').select(userData.state, { force: true });
    // }
    
    // // ZIP is disabled until state is selected
    // if (userData.zip) {
    //     cy.get('#shippingZipCodedefault').should('be.enabled').clear().type(userData.zip);
    // }
    
  
});

Cypress.Commands.add('clickContinueToPayment', () => {
    cy.get('#form-submit').click();
});

Cypress.Commands.add('checkValidationError', (fieldType) => {
    const errorSelectors = {
        email: '#emailInvalidMessage',
        firstName: 'div#shippingAddressFirstName.invalid-feedback',
        phone: 'div#shippingAddressTelephoneNumber.invalid-feedback',
        zip: 'div#shippingAddressZipCode.invalid-feedback',
        empty: '.shipping-empty'
    };
    
    if (errorSelectors[fieldType]) {
        cy.get(errorSelectors[fieldType], { timeout: 3000 }).should('be.visible');
    }
});

Cypress.Commands.add('writeToExcel', (data) => {
    const { prices, quantities, calculatedTotal, websiteTotal, fileName } = data;
    
    const wb = XLSX.utils.book_new();
    
    const excelData = [];
    
    excelData.push(['Item #', 'Price', 'Quantity', 'Subtotal', 'Calculated Total', 'Website Total', 'Match', 'Timestamp']);
    
    prices.forEach((price, index) => {
        const qty = quantities[index];
        const subtotal = price * qty;
        excelData.push([
            `Item ${index + 1}`,
            price,
            qty,
            subtotal,
            '', '', '', ''
        ]);
    });
    
    const match = Math.abs(calculatedTotal - websiteTotal) < 0.01;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    excelData.push([
        'TOTAL',
        '',
        '',
        '',
        calculatedTotal,
        websiteTotal,
        match ? 'YES' : 'NO',
        timestamp
    ]);
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    ws['!cols'] = [
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 20 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Cart Price Validation');
    
    const reportDir = 'test-reports';
    const filePath = path.join(reportDir, fileName || `CartPriceValidation_${Date.now()}.xlsx`);
    
    cy.task('ensureDir', reportDir);
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    cy.task('writeFile', { filePath, data: wbout });
    
    cy.log(`✓ Excel report saved: ${filePath}`);
});