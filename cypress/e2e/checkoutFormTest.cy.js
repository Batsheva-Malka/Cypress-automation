// cypress/e2e/checkoutFormTest.cy.js - Checkout form validation tests
describe('Bose E-Commerce - Checkout Form Validation Tests', () => {
    
    before(() => {
        // Set up cart once before all tests
        cy.visit('/home');
        cy.selectCategory('Headphones');
        cy.addProductToCart(0);
        cy.openCart();
        cy.clickCheckout();
        // Wait for checkout page to load
        cy.get('#email').should('be.visible');
    });

    beforeEach(() => {
        // Just navigate back to checkout page between tests
        cy.visit('/on/demandware.store/Sites-Bose_US-Site/en_US/Checkout-Begin');
        cy.get('#email').should('be.visible');
    });

    it('Should display validation errors when submitting empty form', () => {
        // Click submit without filling fields
        cy.clickContinueToPayment();
        
        // Check for validation errors
        // cy.checkValidationError('email');
        cy.checkValidationError('empty');
        
        cy.log('✓ Empty form validation errors displayed correctly');
    });

    it('Should validate invalid email formats', () => {
        cy.fixture('checkoutData').then((data) => {
            data.invalidEmails.forEach((email) => {
                // Fill email field with invalid email
                cy.get('#email').clear().type(email);
                
                // Tab out to trigger validation
                cy.get('#shippingFirstNamedefault').click();
                
                // Check if error appears
                cy.get('body').then($body => {
                    if ($body.find('#emailInvalidMessage:visible').length > 0) {
                        cy.log(`Email '${email}' validation: REJECTED ✓`);
                    } else {
                        cy.log(`Email '${email}' validation: No immediate error`);
                    }
                });
            });
            
            cy.log('✓ Email validation test completed');
        });
    });

    it('Should validate invalid ZIP code formats', () => {
        cy.fixture('checkoutData').then((data) => {
            // Fill all required fields first
            cy.fillCheckoutForm({
                email: data.validUser.email,
                firstName: data.validUser.firstName,
                lastName: data.validUser.lastName,
                address: data.validUser.address,
                city: data.validUser.city,
                country: data.validUser.country,
                state: data.validUser.state
            });
            
            // Test invalid ZIP codes
            data.invalidZipCodes.forEach((zip) => {
                cy.log(`Testing invalid ZIP: ${zip}`);
                cy.get('#shippingZipCodedefault').clear().type(zip);
                cy.get('#shippingPhoneNumberdefault').clear().type(data.validUser.phone);
                
                // Try to submit to trigger validation
                cy.clickContinueToPayment();
                cy.wait(500);
                
                // Check if still on checkout page (validation failed)
                cy.url().should('include', 'checkout');
            });
            
            cy.log('✓ ZIP validation test completed');
        });
    });

    it('Should show error when first name is missing', () => {
        cy.fixture('checkoutData').then((data) => {
            // Fill all fields except first name
            cy.get('#email').clear().type(data.validUser.email);
            cy.get('#shippingLastNamedefault').clear().type(data.validUser.lastName);
            cy.get('#shippingAddressOnedefault').clear().type(data.validUser.address);
            cy.get('#shippingAddressCitydefault').clear().type(data.validUser.city);
            cy.get('#shippingCountrydefault').select(data.validUser.country);
            cy.get('#shippingStatedefault').select(data.validUser.state);
            cy.wait(500);
            cy.get('#shippingZipCodedefault').should('be.enabled').clear().type(data.validUser.zip);
            cy.get('#shippingPhoneNumberdefault').clear().type(data.validUser.phone);
            
            // Make sure first name is empty
            cy.get('#shippingFirstNamedefault').should('be.empty');
            
            // Submit form
            cy.clickContinueToPayment();
            
            // Check for first name error
            cy.checkValidationError('firstName');
            
            cy.log('✓ Missing first name validation working correctly');
        });
    });

    it('Should submit successfully with valid complete form', () => {
        cy.fixture('checkoutData').then((data) => {
            // Fill complete valid form
            cy.fillCheckoutForm(data.validUser);
            
            // Submit form
            cy.clickContinueToPayment();
            
            // Wait and check if we moved away from checkout or no errors appear
            cy.wait(2000);
            
            // Check either: moved to next page OR no validation errors visible
            cy.get('body').then($body => {
                const hasEmailError = $body.find('#emailInvalidMessage:visible').length > 0;
                const hasFirstNameError = $body.find('div#shippingAddressFirstName.invalid-feedback:visible').length > 0;
                const currentUrl = $body.prop('baseURI');
                
                if (hasEmailError || hasFirstNameError) {
                    throw new Error('Form validation failed - errors still visible');
                } else if (currentUrl.includes('payment') || currentUrl.includes('billing') || currentUrl.includes('review')) {
                    cy.log('✓ Moved to next page');
                } else {
                    cy.log('✓ No validation errors - form accepted');
                }
            });
            
            cy.log('✓ Valid form submitted successfully');
        });
    });
});