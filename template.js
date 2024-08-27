const { Builder, By, until } = require('selenium-webdriver')
const assert = require('assert')
const { error } = require('console')

describe('Input title here', function() {
    this.timeout(Infinity)
    const driver = new Builder().forBrowser("chrome").build()

    // URL and Credentials
    const webUrl = 'https://www.saucedemo.com/'
    const standardUser = "standard_user"
    const lockedOutUser = "locked_out_user"
    const passwordAllUser = "secret_sauce"

    // Locators
    const locators = {
        loginButton: By.id('login-button'),
        errorMessage: By.xpath('//h3[@data-test="error"]'),
        closeButton: By.xpath('//*[@id="login_button_container"]/div/form/div[3]/h3/button'),
        passwordField: By.id('password'),
        userNameField: By.id('user-name'),
        hamburgerButton: By.id('react-burger-menu-btn'),
        logoutButton: By.id('logout_sidebar_link'),
        filterButton: By.xpath('//*[@id="header_container"]/div[2]/div/span/select'),
        productNames: '(//div[@data-test="inventory-item-name"])',
        productPrices: '(//div[@data-test="inventory-item-price"])',
        buttonAdd: '(//div[@data-test="inventory-item-description"]/div[2]/button)',
        optionAscByName: By.xpath('//*[@id="header_container"]/div[2]/div/span/select/option[1]'),
        optionDscByName: By.xpath('//*[@id="header_container"]/div[2]/div/span/select/option[2]'),
        optionAscByPrice: By.xpath('//*[@id="header_container"]/div[2]/div/span/select/option[3]'),
        optionDscByPrice: By.xpath('//*[@id="header_container"]/div[2]/div/span/select/option[4]'),
        shoppingCartBadge: By.xpath('//*[@id="shopping_cart_container"]/a/span'),
        cartButton: By.xpath('//*[@id="shopping_cart_container"]'),
        continueShoppingButton: By.xpath('//button[@data-test="continue-shopping"]'),
        backToProductsButton: By.xpath('//button[@data-test="back-to-products"]'),
        socialTwitter: By.xpath('//a[@data-test="social-twitter"]'),
        socialFacebook: By.xpath('//a[@data-test="social-facebook"]'),
        socialLinkedin: By.xpath('//a[@data-test="social-linkedin"]'),
    }

    after(async () => {
        await driver.quit()
    })

    // Helper Functions
    async function waitUntilAllElementIsDisplayed() {
        await driver.wait(async () => {
            return await driver.executeScript('return document.readyState') === 'complete'
        }, 10000)   
    }
    
    async function clickButton(locator) {
        await driver.findElement(locator).click()  
    };

    async function navigate(webUrls, buttonLocators, navigationAction) {
        try {
            if (webUrls) {await driver.get(webUrls)}
            
            if (buttonLocators) {await clickButton(buttonLocators)}
            
            if (navigationAction === 'back') {
                await driver.navigate().back()
            } else if (navigationAction === 'forward') {
                await driver.navigate().forward()
            }

            await waitUntilAllElementIsDisplayed()
        } catch (error) {
            console.error('Error in navigating function', error)
        }
        
    }

    async function enterCredentials(userName = '', password = '') {
        if (userName) await driver.findElement(locators.userNameField).sendKeys(userName)
        if (password) await driver.findElement(locators.passwordField).sendKeys(password)
    }

    async function login(userName = '', password = '') {
        await enterCredentials(userName, password)
        await clickButton(locators.loginButton)

        await waitUntilAllElementIsDisplayed()
    }

    async function logout() {
        await clickButton(locators.hamburgerButton)
        await driver.wait(until.elementLocated(locators.logoutButton)).isDisplayed()
        await clickButton(locators.logoutButton)
    }

    async function refreshTheBrowser() {
        await driver.navigate().refresh()
        await waitUntilAllElementIsDisplayed()
    }

    async function getMultiItem(locator, volume) {
        let items = []
        for (let i = 1; i <= volume; i++) {
            let item = await driver.findElement(By.xpath(`${locator}[${i}]`)).getText()
            items.push(item)
        }
        return items  
    }

    async function clickMultiButton(locator, volume) {
        for (let i = 1; i <= volume; i++) {
            let randomNumb = Math.floor(Math.random() * volume) + 1
            let button = await driver.findElement(By.xpath(`${locator}[${randomNumb}]`))
            await button.click()
        }
    }

    async function applySortingOption(optionFilter) {
        await clickButton(locators.filterButton)
        await driver.sleep(1000)
        await clickButton(optionFilter)
    }

    describe('Login Page', function() {
        before('Navigate to the website', async () => {
            await navigate(webUrl, '', '')
        })

        it('Login with empty fields', async () => {
            await login()
            
            const alertMessage = await driver.findElement(locators.errorMessage).getText()
            assert.equal(alertMessage, 'Epic sadface: Username is required')
            
            await clickButton(locators.closeButton)
        })

        it('Login with empty username', async () => {
            await refreshTheBrowser()
            
            await login('', passwordAllUser)
            
            const alertMessage = await driver.findElement(locators.errorMessage).getText()
            assert.equal(alertMessage, 'Epic sadface: Username is required')
            
            await clickButton(locators.closeButton)
        })

        it('Login with empty password', async () => {
            await refreshTheBrowser()
            
            await login(standardUser, '')
            
            let alertMessage = await driver.findElement(locators.errorMessage).getText()
            assert.equal(alertMessage, 'Epic sadface: Password is required')
            
            await clickButton(locators.closeButton)
        })

        it('Login with locked out user', async () => {
            await refreshTheBrowser()
            
            await login(lockedOutUser, passwordAllUser)
            
            let alertMessage = await driver.findElement(locators.errorMessage).getText()
            assert.equal(alertMessage, 'Epic sadface: Sorry, this user has been locked out.')
            
            await clickButton(locators.closeButton)
        })

        it('Login with standard user', async () => {
            await refreshTheBrowser()
            
            await login(standardUser, passwordAllUser)
            
            let currentUrl = await driver.getCurrentUrl()
            assert.equal(currentUrl, 'https://www.saucedemo.com/inventory.html')
            await driver.sleep(2000)
            
            await logout()
        })
    })
})
