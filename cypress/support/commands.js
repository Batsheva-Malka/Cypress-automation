// cypress/support/commands.js - Custom reusable commands
// ***********************************************
// Custom commands for Bose E-Commerce Testing
// ***********************************************

// Command to select a category from the shop menu
Cypress.Commands.add('selectCategory', (categoryName) => {
    cy.get('.secondary-navigation__button')
      .contains(categoryName, { matchCase: false })
      .click();
});

// Command to add product to cart by index
Cypress.Commands.add('addProductToCart', (productIndex = 0) => {
    cy.get('.product-tile-content')
      .eq(productIndex)
      .find('button.add-to-cart')
      .should('be.visible')
      .click();
});

// Command to open shopping cart
Cypress.Commands.add('openCart', () => {
    cy.scrollTo('top');
    cy.get('.minicart-link').click();
    cy.get('.product-cart-wrapper.row').should('be.visible');
});

// Command to increase product quantity in cart
Cypress.Commands.add('increaseQuantity', (itemIndex = 0) => {
    cy.get('.product-cart-wrapper.row')
      .eq(itemIndex)
      .find('.quantity__counter-button.quantity__counter-plus')
      .click();
    cy.wait(1000); // Wait for price update
});

// Command to get cart item prices
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

// Command to get cart item quantities
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

// Command to get total price from website
Cypress.Commands.add('getTotalPrice', () => {
    return cy.get('.cart-total__value.cart-total--grand.estimated-total')
      .invoke('text')
      .then(text => parseFloat(text.replace(/[^0-9.]/g, '')));
});

// Command to click checkout button
Cypress.Commands.add('clickCheckout', () => {
    cy.get('.checkout__button').click();
});


// Command to fill checkout form
Cypress.Commands.add('fillCheckoutForm', (userData) => {
    // Wait for the entire form to be ready/enabled
    cy.get('#email').should('be.enabled');
    cy.get('#shippingFirstNamedefault').should('be.enabled');
    cy.get('#shippingLastNamedefault').should('be.enabled');
    
    // Now fill the form
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
    // Address field may have autocomplete overlay
    if (userData.address) {
        cy.get('#shippingAddressOnedefault').should('be.enabled').clear({ force: true }).type(userData.address, { force: true });
        
        // Wait for autocomplete suggestions and select the one containing "123 Main Street Anx"
        cy.get('.edq-global-intuitive-address-suggestion', { timeout: 5000 })
          .should('be.visible')
          .contains('123 Main Street Anx')
          .click();
        
        // Wait for auto-fill to complete
        cy.wait(1000);
    }
    
    // City field may have autocomplete overlay
    if (userData.city) {
        cy.get('#shippingAddressCitydefault').should('be.enabled').clear({ force: true }).type(userData.city, { force: true });
    }
    
    // Country/State have pointer-events: none
    if (userData.country) {
        cy.get('#shippingCountrydefault').should('be.enabled').select(userData.country, { force: true });
    }
    
    if (userData.state) {
        cy.get('#shippingStatedefault').should('be.enabled').select(userData.state, { force: true });
    }
    
    // ZIP is disabled until state is selected
    if (userData.zip) {
        cy.get('#shippingZipCodedefault').should('be.enabled').clear().type(userData.zip);
    }
    
  
});

// Command to click continue to payment
Cypress.Commands.add('clickContinueToPayment', () => {
    cy.get('#form-submit').click();
});

// Command to check for validation errors
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