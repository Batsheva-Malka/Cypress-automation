// cypress/e2e/shoppingCartTest.cy.js - Shopping cart tests
describe('Bose E-Commerce - Shopping Cart Tests', () => {
    
    beforeEach(() => {
        cy.visit('/home');
    });

    it('Should add items from three categories and validate cart total', () => {
        // Load test data
        cy.fixture('checkoutData').then((data) => {
            const categories = data.categories;
            
            // Add product from Headphones category
            cy.selectCategory(categories.headphones);
            cy.addProductToCart(0);
            
            // Return to home and add from Speakers
            cy.visit('/home');
            cy.selectCategory(categories.speakers);
            cy.addProductToCart(0);
            
            // Return to home and add from Earbuds
            cy.visit('/home');
            cy.selectCategory(categories.earbuds);
            cy.addProductToCart(0);
            
            // Open cart and increase quantity of third item
            cy.openCart();
            cy.increaseQuantity(2);
            
            // Get prices and quantities
            cy.getCartPrices().then((prices) => {
                cy.getCartQuantities().then((quantities) => {
                    // Calculate expected total
                    let calculatedTotal = 0;
                    prices.forEach((price) => {
                        calculatedTotal += price;
                    });
                    
                    // Get website total
                    cy.getTotalPrice().then((websiteTotal) => {
                        // Log summary
                        cy.log('=== CART SUMMARY ===');
                        prices.forEach((price, i) => {
                            cy.log(`Item ${i + 1}: $${price} x ${quantities[i]}`);
                        });
                        cy.log(`Calculated Total: $${calculatedTotal.toFixed(2)}`);
                        cy.log(`Website Total: $${websiteTotal.toFixed(2)}`);
                        
                        // Validate totals match (within 1 cent tolerance)
                        expect(Math.abs(calculatedTotal - websiteTotal)).to.be.lessThan(0.01);
                        cy.log('✓ Cart total validation passed!');
                    });
                });
            });
        });
    });

    it('Should capture screenshots before and after checkout', () => {
        // Load test data
        cy.fixture('checkoutData').then((data) => {
            const categories = data.categories;
            
            // Add products to cart (simplified - just one for screenshot test)
            cy.selectCategory(categories.headphones);
            cy.addProductToCart(0);
            
            // Open cart
            cy.openCart();
            
            // Screenshot BEFORE checkout
            cy.screenshot('before_checkout');
            
            // Click checkout
            cy.clickCheckout();
            
            // Screenshot AFTER checkout (on checkout page)
            cy.screenshot('after_checkout');
            
            cy.log('✓ Screenshots captured successfully!');
        });
    });
});