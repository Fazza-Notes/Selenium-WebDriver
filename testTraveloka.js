const { Builder, Browser, By, Key, until, Select } = require('selenium-webdriver');


async function test() {
    let driver = await new Builder.forBrowser('chrome').build();
    
    try {
        for (let i =1,) {

        }
    } finally {
        await driver.quit();
    }
};