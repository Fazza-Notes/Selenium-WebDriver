const { Builder, Browser, By, Key, until, Select } = require('selenium-webdriver');
const { Driver } = require('selenium-webdriver/chrome');
const assert = require('assert');
const download = require('image-downloader');


async function login() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    //Navigate to website
    await driver.get('https://www.saucedemo.com/');
  
    //Login with valid credential
    await driver.get('https://www.saucedemo.com/');
    await driver.findElement(By.xpath('//*[@id="user-name"]')).sendKeys('standard_user');
    await driver.sleep(1000);
    await driver.findElement(By.xpath('//*[@id="password"]')).sendKeys('secret_sauce');
    await driver.sleep(1000);
    await driver.findElement(By.xpath('//*[@id="login-button"]')).click();
    await driver.sleep(3000);

    //Extract data
    let getVolume = await driver.executeScript(`return document.querySelectorAll('div[data-test="inventory-item-name"]').length`);
    let productsOrigin = [];
    for (let i =1; i <= getVolume; i++) {
      let products = await driver.findElement(By.xpath(`(//div[@data-test="inventory-item-name"])[${i}]`)).getText();
      productsOrigin.push(products);
    };


    //Order by name a-z
    await driver.findElement(By.xpath('//*[@id="header_container"]/div[2]/div/span/select')).click();
    await driver.sleep(2000);
    await driver.findElement(By.xpath('//*[@id="header_container"]/div[2]/div/span/select/option[1]')).click();
    await driver.sleep(3000);
    let getProductsAscending = [];
    for (let i =1; i <= getVolume; i++) {
      let products = await driver.findElement(By.xpath(`(//div[@data-test="inventory-item-name"])[${i}]`)).getText();
      getProductsAscending.push(products);
    };
    await driver.sleep(2000);
    
    //Order by name z-a
    await driver.findElement(By.xpath('//*[@id="header_container"]/div[2]/div/span/select')).click();
    await driver.sleep(2000);
    await driver.findElement(By.xpath('//*[@id="header_container"]/div[2]/div/span/select/option[2]')).click();
    await driver.sleep(3000);
    let getProductsDescending = [];
    for (let i =1; i <= getVolume; i++) {
      let products = await driver.findElement(By.xpath(`(//div[@data-test="inventory-item-name"])[${i}]`)).getText();
      getProductsDescending.push(products);
    };
    await driver.sleep(2000);

    //Order by price low-high
    await driver.findElement(By.xpath('//*[@id="header_container"]/div[2]/div/span/select')).click();
    await driver.sleep(3000);
    await driver.findElement(By.xpath('//*[@id="header_container"]/div[2]/div/span/select/option[3]')).click();
    await driver.sleep(3000);
    let getPriceAscending = [];
    for (let i =1; i <= getVolume; i++) {
      let products = await driver.findElement(By.xpath(`(//div[@data-test="inventory-item-price"])[${i}]`)).getText();
      getPriceAscending.push(products);
    };
    await driver.sleep(3000);

    //Order by price high-low
    await driver.findElement(By.xpath('//*[@id="header_container"]/div[2]/div/span/select')).click();
    await driver.sleep(3000);
    await driver.findElement(By.xpath('//*[@id="header_container"]/div[2]/div/span/select/option[4]')).click();
    await driver.sleep(3000);
    let getPriceDescending = [];
    for (let i =1; i <= getVolume; i++) {
      let products = await driver.findElement(By.xpath(`(//div[@data-test="inventory-item-price"])[${i}]`)).getText();
      getPriceDescending.push(products);
    };

    console.log(getPriceDescending);
    await driver.sleep(3000);


    //Logout
    await driver.findElement(By.xpath('//*[@id="react-burger-menu-btn"]')).click();
    await driver.sleep(2000);
    await driver.findElement(By.xpath('//*[@id="logout_sidebar_link"]')).click();
    await driver.sleep(2000);
      

  } catch (e) {
    console.log('Error: Gagal', e);
  } finally {
    await driver.quit();
  }
};

login();
