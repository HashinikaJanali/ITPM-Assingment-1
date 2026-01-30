const { test, expect } = require('@playwright/test');

test.describe('UI Tests - Swift Translator Responsiveness', () => {

  test('Pos_UI_0001 – UI responsiveness with short informal input', async ({ page }) => {
    await page.goto('https://www.swifttranslator.com/', { 
      waitUntil: 'networkidle', 
      timeout: 60000 
    });

    
    const inputLocator = page.getByPlaceholder(/singlish/i);
    await inputLocator.waitFor({ state: 'visible', timeout: 20000 });
    await expect(inputLocator).toBeVisible();
    await expect(inputLocator).toBeEditable();

 
    const startTime = Date.now();

   
    const shortInput = 'api adha yamu';
    await inputLocator.fill(shortInput);
    await inputLocator.press('Enter');
    await page.waitForTimeout(4000);   

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    
    let outputText = '';

    const sinhalaElement = page.locator('div, span, p, [contenteditable="true"], *:not(textarea)')
      .filter({ hasText: /[\u0D80-\u0DFF]/ })
      .first();

    try {
      await sinhalaElement.waitFor({ state: 'visible', timeout: 10000 });
      outputText = await sinhalaElement.innerText();
    } catch {
     
      const bodyText = await page.innerText('body');
      const matches = bodyText.match(/[\u0D80-\u0DFF\s\.,!?()'"“”‘’…-]+/g) || [];
      outputText = matches.join(' ');
    }

   
    expect(responseTime).toBeLessThan(5000); 

    expect(outputText).toMatch(/[\u0D80-\u0DFF]/); 
    expect(outputText.trim()).not.toBe('');        

    
    expect(outputText).toContain('අපි'); 
    expect(outputText).toContain('අද'); 
    expect(outputText).toContain('යමු'); 

    console.log(`Pos_UI_0001 - Response time: ${responseTime}ms`);
    console.log('Detected Sinhala output:', outputText.trim());
  });

});