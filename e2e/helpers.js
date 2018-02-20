import { Builder } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome'
import selenium from 'selenium-standalone';
import serve from 'serve';
import path from 'path';

import axe from 'axe-webdriverjs';

let driver;
let instance;
let server;

export const getDriver = () => {
    if (driver) {
        return driver;
    }

    const options = new Options();
    options.addArguments('headless');

    driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .usingServer('http://localhost:4444/wd/hub')
        .build();

    driver
        .manage()
        .window()
        .setSize(1280, 1024);

    return driver;
};

export const analyzeAccessibility = () =>
    new Promise(resolve => {
        axe(driver).analyze(results => resolve(results));
    });

export const formatAccessibilityViolations = violations => {
    const messages = violations.map(
        violation =>
            `\r\n- ${violation.help} (${violation.nodes.length} elements affected)`,
    );
    return `${violations.length} violations found: ${messages.join()}`;
};

before(async () => {
    await new Promise((resolve, reject) => {
        selenium.install(error => error ? reject(error) : resolve());
    });

    instance = await new Promise((resolve, reject) => {
        selenium.start((error, instance) => error ? reject(error) : resolve(instance));
    });

    server = serve(path.join(__dirname, '..', 'build'), {
        port: 8080,
    });
});

after(async () => {
    driver && await driver.quit();
    instance && instance.kill();
    server && server.stop();
})
