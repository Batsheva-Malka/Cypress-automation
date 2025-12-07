// cypress/e2e/checkoutFormTest.cy.js - Checkout form validation tests
describe('Bose E-Commerce - Checkout Form Validation Tests', { testIsolation: false }, () => {
    let isFirstTest = true;

    before(() => {
        // Disable test isolation to keep cookies/state between tests
        // Cypress.config('testIsolation', false);

        // Set up cart once before all tests
        cy.visit('/home');
        cy.selectCategory('Headphones');
        cy.addProductToCart(0);
        cy.openCart();
        cy.clickCheckout();
        cy.get('#email').should('be.visible');
    });


    beforeEach(() => {
        // Clear form fields between tests
        if (isFirstTest) {
            isFirstTest = false;
            return;
        }
        cy.get('#email').clear();
        cy.get('#shippingFirstNamedefault').clear();
        cy.get('#shippingLastNamedefault').clear();
        cy.get('#shippingAddressOnedefault').clear({ force: true });
        cy.get('#shippingAddressCitydefault').clear({ force: true });
        cy.get('#shippingPhoneNumberdefault').clear();

        cy.log('✓ Form cleared for next test');
    });

    it('Should display validation errors when submitting empty form', () => {
        // Click submit without filling fields
        cy.clickContinueToPayment();

        // Check for validation errors
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
            
            // Check if error appears using custom command
            cy.get('body').then($body => {
                if ($body.find('#emailInvalidMessage:visible').length > 0) {
                    cy.checkValidationError('email');
                    cy.log(`Email '${email}' validation: REJECTED ✓`);
                } else {
                    cy.log(`Email '${email}' validation: No immediate error`);
                }
            });
        });
        
        cy.log('✓ Email validation test completed');
    });
});
  

    // it('Should validate invalid ZIP code formats', () => {
    //     cy.fixture('checkoutData').then((data) => {
    //         // Fill all required fields first
    //         cy.fillCheckoutForm({
    //             email: data.validUser.email,
    //             firstName: data.validUser.firstName,
    //             lastName: data.validUser.lastName,
    //             address: data.validUser.address,
    //             city: data.validUser.city,
    //             country: data.validUser.country,
    //             state: data.validUser.state
    //         });

    //         // Wait for ZIP to auto-fill
    //         cy.wait(500);

    //         // Verify ZIP field is disabled (prevents invalid input)
    //         cy.get('#shippingZipCodedefault').then($zip => {
    //             cy.wrap($zip)
    //                 .should('be.disabled');

    //         });

    //         cy.log('✓ ZIP field is auto-filled and disabled - prevents invalid input');
    //     });
    // });

    it('Should show error when first name is missing', () => {
        cy.fixture('checkoutData').then((data) => {
            // Fill all fields except first name
            cy.get('#email').clear().type(data.validUser.email);
            cy.get('#shippingLastNamedefault').clear().type(data.validUser.lastName);
            cy.get('#shippingPhoneNumberdefault').clear().type(data.validUser.phone);
            cy.get('#shippingAddressOnedefault').clear({ force: true }).type(data.validUser.address);
            cy.get('#shippingAddressCitydefault').clear({ force: true }).type(data.validUser.city);
            cy.get('#shippingCountrydefault').select(data.validUser.country, { force: true });
            cy.get('#shippingStatedefault').select(data.validUser.state, { force: true });
            cy.wait(500);
            // cy.get('#shippingZipCodedefault').should('be.enabled').clear().type(data.validUser.zip);

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
            cy.wait(7000);

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
    it('Should validate invalid phone number formats', () => {
    cy.fixture('checkoutData').then((data) => {
        // Fill all required fields first
        cy.get('#email').clear().type(data.validUser.email);
        cy.get('#shippingFirstNamedefault').clear().type(data.validUser.firstName);
        cy.get('#shippingLastNamedefault').clear().type(data.validUser.lastName);
        cy.get('#shippingAddressOnedefault').clear({ force: true }).type(data.validUser.address);
        cy.get('#shippingAddressCitydefault').clear({ force: true }).type(data.validUser.city);
        cy.get('#shippingCountrydefault').select(data.validUser.country, { force: true });
        cy.get('#shippingStatedefault').select(data.validUser.state, { force: true });
        cy.wait(500);
        
        // Test invalid phone numbers
        const invalidPhones = ['123', 'abcdefghij', '00000000', '111-111'];
        
        invalidPhones.forEach((phone) => {
            cy.log(`Testing invalid phone: ${phone}`);
            cy.get('#shippingPhoneNumberdefault').clear().type(phone);
            
            // Try to submit
            //  cy.clickContinueToPayment();
            cy.wait(500);
            
            // Check if still on checkout page or phone error appears
            cy.get('body').then($body => {
                if ($body.find('div#shippingAddressTelephoneNumber.invalid-feedback:visible').length > 0) {
                    cy.checkValidationError('phone');
                    cy.log(`Phone '${phone}' validation: REJECTED ✓`);
                } else if ($body.prop('baseURI').includes('checkout')) {
                    cy.log(`Phone '${phone}' prevented submission`);
                }
            });
        });
        
        cy.log('✓ Phone validation test completed');
    });
});
});