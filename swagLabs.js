const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const { buildPath } = require('selenium-webdriver/http');
const { error, Console } = require('console');
const fs = require('fs');
const path = require('path');

describe('Automation Test', function () {
  const driver = new Builder().forBrowser('chrome').build();

  this.timeout(Infinity);

  // URL and Credentials
  const baseUrl = 'https://www.saucedemo.com/',
    standardUser = 'standard_user',
    lockedOutUser = 'locked_out_user',
    passwordAllUser = 'secret_sauce';

  // Locators
  const locators = {
    // Login page
    loginButton: By.id('login-button'),
    errorMessage: By.xpath('//h3[@data-test="error"]'),
    closeButton: By.xpath(
      '//*[@id="login_button_container"]/div/form/div[3]/h3/button'
    ),
    passwordField: By.id('password'),
    userNameField: By.id('user-name'),

    // Beranda
    hamburgerButton: By.id('react-burger-menu-btn'),
    logoutButton: By.id('logout_sidebar_link'),
    filterButton: By.xpath(
      '//*[@id="header_container"]/div[2]/div/span/select'
    ),
    productNames: '(//div[@data-test="inventory-item-name"])',
    productPrices: '(//div[@data-test="inventory-item-price"])',
    productCards: '(//div[@data-test="inventory-item-description"])',
    buttonAdd: '(//div[@data-test="inventory-item-description"]/div[2]/button)',
    optionAscByName: By.xpath(
      '//*[@id="header_container"]/div[2]/div/span/select/option[1]'
    ),
    optionDscByName: By.xpath(
      '//*[@id="header_container"]/div[2]/div/span/select/option[2]'
    ),
    optionAscByPrice: By.xpath(
      '//*[@id="header_container"]/div[2]/div/span/select/option[3]'
    ),
    optionDscByPrice: By.xpath(
      '//*[@id="header_container"]/div[2]/div/span/select/option[4]'
    ),
    shoppingCartBadge: By.xpath('//*[@id="shopping_cart_container"]/a/span'),
    cartButton: By.xpath('//*[@id="shopping_cart_container"]'),
    socialTwitter: By.xpath('//a[@data-test="social-twitter"]'),
    socialFacebook: By.xpath('//a[@data-test="social-facebook"]'),
    socialLinkedin: By.xpath('//a[@data-test="social-linkedin"]'),
    aboutSidebarLink: By.xpath('//a[@data-test="about-sidebar-link"]'),
    resetSidebarLink: By.xpath('//a[@data-test="reset-sidebar-link"]'),

    // Detail product page
    backToProductsButton: By.xpath('//button[@data-test="back-to-products"]'),

    // Cart page
    continueShoppingButton: By.xpath(
      '//button[@data-test="continue-shopping"]'
    ),
  };

  after(async () => {
    await driver.quit();
  });

  // Helper Functions
  async function clickButton(locator) {
    await driver.findElement(locator).click();
  }

  async function navigate(baseUrl, buttonLocator, navigationAction) {
    try {
      if (baseUrl) {
        await driver.get(baseUrl);
      }

      if (buttonLocator) {
        await clickButton(buttonLocator);
      }

      if (navigationAction === 'back') {
        await driver.navigate().back();
      } else if (navigationAction === 'forward') {
        await driver.navigate().forward();
      }
    } catch (error) {
      console.error('Error in navigating function', error);
    }
  }

  async function enterCredentials(userName = '', password = '') {
    if (userName)
      await driver.findElement(locators.userNameField).sendKeys(userName);
    if (password)
      await driver.findElement(locators.passwordField).sendKeys(password);
  }

  async function login(userName = '', password = '') {
    await enterCredentials(userName, password);
    await clickButton(locators.loginButton);
  }

  async function logout() {
    await clickButton(locators.hamburgerButton);
    await driver
      .wait(until.elementLocated(locators.logoutButton))
      .isDisplayed();
    await clickButton(locators.logoutButton);
  }

  async function refreshTheBrowser() {
    await driver.navigate().refresh();
  }

  async function getMultiItem(locator, volume) {
    let items = [];
    for (let i = 1; i <= volume; i++) {
      let item = await driver
        .findElement(By.xpath(`${locator}[${i}]`))
        .getText();
      items.push(item);
    }
    return items;
  }

  async function clickMultiButton(locator, volume) {
    for (let i = 1; i <= volume; i++) {
      const randomNumb = Math.floor(Math.random() * volume) + 1;
      const button = await driver.findElement(
        By.xpath(`${locator}[${randomNumb}]`)
      );
      await button.click();
    }
  }

  async function applySortingOption(optionFilter) {
    await clickButton(locators.filterButton);
    await driver.sleep(1000);
    await clickButton(optionFilter);
  }

  async function takeAScreenshot(fileName) {
    const screenshot = await driver.takeScreenshot();

    const forlderPath = path.join(__dirname, 'documentation');
    const filePath = path.join(forlderPath, fileName);

    if (!fs.existsSync(forlderPath)) {
      fs.mkdirSync(forlderPath);
    }

    await fs.writeFileSync(`${filePath}`, screenshot, 'base64');
  }

  describe('Login Page', function () {
    before('Navigate to the website', async () => {
      await driver.manage().window().maximize();

      await navigate(baseUrl, '', '');
    });

    it('Login with empty fields', async () => {
      await login();

      const alertMessage = await driver
        .findElement(locators.errorMessage)
        .getText();
      assert.equal(alertMessage, 'Epic sadface: Username is required');

      await clickButton(locators.closeButton);
    });

    it('Login with empty username', async () => {
      await refreshTheBrowser();

      await login('', passwordAllUser);

      const alertMessage = await driver
        .findElement(locators.errorMessage)
        .getText();
      assert.equal(alertMessage, 'Epic sadface: Username is required');

      await clickButton(locators.closeButton);
    });

    it('Login with empty password', async () => {
      await refreshTheBrowser();

      await login(standardUser, '');

      let alertMessage = await driver
        .findElement(locators.errorMessage)
        .getText();
      assert.equal(alertMessage, 'Epic sadface: Password is required');

      await clickButton(locators.closeButton);
    });

    it('Login with locked out user', async () => {
      await refreshTheBrowser();

      await login(lockedOutUser, passwordAllUser);

      let alertMessage = await driver
        .findElement(locators.errorMessage)
        .getText();
      assert.equal(
        alertMessage,
        'Epic sadface: Sorry, this user has been locked out.'
      );

      await clickButton(locators.closeButton);
    });

    it('Login with standard user', async () => {
      await refreshTheBrowser();

      await login(standardUser, passwordAllUser);

      let currentUrl = await driver.getCurrentUrl();
      assert.equal(currentUrl, 'https://www.saucedemo.com/inventory.html');
      await driver.sleep(2000);
    });
  });

  let productVolume, productNames, productPrices;

  describe('Beranda', function () {
    before('Initialize product data', async () => {
      productVolume = await driver.executeScript(
        'return document.querySelectorAll(\'div[data-test="inventory-item-description"]\').length'
      );
      productNames = await getMultiItem(locators.productNames, productVolume);
      productPrices = await getMultiItem(locators.productPrices, productVolume);
    });

    it('Check ascending & descending sort by name', async () => {
      const sortedNamesAsc = [...productNames].sort();
      const sortedNamesDesc = [...productNames].sort().reverse();

      await applySortingOption(locators.optionAscByName);
      const displayedNamesAsc = await getMultiItem(
        locators.productNames,
        productVolume
      );
      assert.deepEqual(displayedNamesAsc, sortedNamesAsc);

      await applySortingOption(locators.optionDscByName);
      const displayedNamesDesc = await getMultiItem(
        locators.productNames,
        productVolume
      );
      assert.deepEqual(displayedNamesDesc, sortedNamesDesc);
    });

    it('Check ascending & descending sort by price', async () => {
      let sortedPricesAsc = [...productPrices]
        .map((price) => parseFloat(price.replace('$', '')))
        .sort((a, b) => a - b);
      sortedPricesAsc = sortedPricesAsc.map((price) => `$${price.toFixed(2)}`);
      let sortedPricesDesc = [...sortedPricesAsc].reverse();

      await applySortingOption(locators.optionAscByPrice);
      let displayedPricesAsc = await getMultiItem(
        locators.productPrices,
        productVolume
      );
      assert.deepEqual(displayedPricesAsc, sortedPricesAsc);

      await applySortingOption(locators.optionDscByPrice);
      let displayedPricesDesc = await getMultiItem(
        locators.productPrices,
        productVolume
      );
      assert.deepEqual(displayedPricesDesc, sortedPricesDesc);

      await driver.sleep(1000);
    });

    it('Check adding products to the cart', async () => {
      await clickMultiButton(locators.buttonAdd, productVolume);

      const cartBadge = await driver.wait(
        until.elementLocated(locators.shoppingCartBadge),
        5000
      );
      const isDisplayed = await cartBadge.isDisplayed();
      assert.equal(isDisplayed, true);

      const buttonVolume = await getMultiItem(
        locators.buttonAdd,
        productVolume
      );
      const buttonRemoveVolume = (await [...buttonVolume]).filter(
        (item) => item === 'Remove'
      );
      const countBadge = await cartBadge.getText();
      assert.deepEqual(countBadge, buttonRemoveVolume.length);
    });

    it('Check navigation to Cart page', async () => {
      await navigate('', locators.cartButton, '');
      const currentUrl = await driver.getCurrentUrl();
      assert.equal(currentUrl, 'https://www.saucedemo.com/cart.html');
    });

    it('Check navigation to Detail Product page', async () => {
      await navigate('', locators.continueShoppingButton, '');

      const randomNumb = Math.floor(Math.random() * productVolume);
      const cardTitleLink = By.xpath(
        `(//a[@data-test="item-${randomNumb}-title-link"])`
      );

      await navigate('', cardTitleLink, '');
      const currentUrl = await driver.getCurrentUrl();
      assert.equal(
        currentUrl,
        `https://www.saucedemo.com/inventory-item.html?id=${randomNumb}`
      );
    });

    it('Check navigation to social Twitter', async () => {
      await navigate('', locators.backToProductsButton, '');

      await navigate('', locators.socialTwitter, '');
      const allTabs = await driver.getAllWindowHandles();

      await driver.switchTo().window(allTabs[1]);

      const currentUrl = await driver.getCurrentUrl();
      assert(currentUrl, 'https://x.com/saucelabs');

      await takeAScreenshot('Social_Twitter');
      await driver.close();

      await driver.switchTo().window(allTabs[0]);
    });

    it('Check navigation to social Facebook', async () => {
      await navigate('', locators.socialFacebook, '');
      let allTabs = await driver.getAllWindowHandles();

      await driver.switchTo().window(allTabs[1]);

      let currentUrl = await driver.getCurrentUrl();
      assert(currentUrl, 'https://www.facebook.com/saucelabs');

      await takeAScreenshot('Social_Facebook');
      await driver.close();

      await driver.switchTo().window(allTabs[0]);
    });

    it('Check navigation to social Linkedin', async () => {
      await navigate('', locators.socialLinkedin, '');
      let allTabs = await driver.getAllWindowHandles();

      await driver.switchTo().window(allTabs[1]);

      let currentUrl = await driver.getCurrentUrl();
      assert(currentUrl, 'https://www.linkedin.com/company/sauce-labs/');

      await takeAScreenshot('Social_Linkedin');
      await driver.close();

      await driver.switchTo().window(allTabs[0]);
    });

    it('Check navigation to About', async () => {
      await clickButton(locators.hamburgerButton);

      const sidebar = await driver.wait(
        until.elementLocated(locators.aboutSidebarLink)
      );
      await driver.wait(until.elementIsVisible(sidebar), 2000);

      await navigate('', locators.aboutSidebarLink, '');
      let currentUrl = await driver.getCurrentUrl();
      assert(currentUrl, 'https://saucelabs.com/');
      await takeAScreenshot('About');

      await navigate('', '', 'back');
    });

    it('Check reset app state', async () => {
      await clickButton(locators.hamburgerButton);

      const resetSidebar = await driver.wait(
        until.elementLocated(locators.resetSidebarLink)
      );
      await driver.wait(until.elementIsVisible(resetSidebar), 2000);
      await clickButton(locators.resetSidebarLink);

      async function verifyTheCartBadge() {
        let isDisplayed = true;
        try {
          const cartBadge = await driver.findElement(
            locators.shoppingCartBadge
          );
          isDisplayed = await cartBadge.isDisplayed();
        } catch (error) {
          if (
            error.name === 'NoSuchElementError' ||
            error.name === 'NoSuchElementException'
          ) {
            isDisplayed = false;
          } else {
            console.error(error);
            throw error;
          }
        }
        assert.equal(isDisplayed, false);
      }
      await verifyTheCartBadge();
    });
  });

  describe('Cart page', function () {
    before('Add product to cart', async () => {
      await clickMultiButton(locators.buttonAdd, productVolume);
    });

    it('Navigate to the cart page', async () => {
      let buttonRemove = await getMultiItem(locators.buttonAdd, productVolume);
      let removeButtonIndex = [];
      buttonRemove.forEach((button, index) => {
        if (button === 'Remove') {
          removeButtonIndex.push(index);
        }
      });

      let productTitles = [];
      for (let i = 0; i < removeButtonIndex.length; i++) {
        let title = await driver
          .findElement(
            By.xpath(`${locators.productNames}[${removeButtonIndex[i]}]`)
          )
          .getText();
        productTitles.push(title);
        console.log('ini kena');
      }

      console.log('removeButtonIndex : ', removeButtonIndex);
      console.log('productTitles : ', productTitles);

      await driver.sleep(2000);
    });
  });
});
