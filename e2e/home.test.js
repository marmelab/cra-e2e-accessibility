import assert from 'assert';
import { By, until } from 'selenium-webdriver';
import {
    getDriver,
    analyzeAccessibility,
    formatAccessibilityViolations,
} from './helpers';

describe('Home page', () => {
    let driver;

    before(() => {
        driver = getDriver();
    });

    it('has no accessibility issues', async () => {
        await driver.get(`http://localhost:8080`);

        // Wait until our content is visible, here we just wait for title
        await driver.wait(until.elementLocated(By.css('h1')));

        const result = await analyzeAccessibility();

        const title = await driver.findElement(By.css('h1')).getText();
        assert.equal(title, 'Welcome to React');

        assert.equal(
            result.violations.length,
            0,
            formatAccessibilityViolations(result.violations)
        );
    });
});
