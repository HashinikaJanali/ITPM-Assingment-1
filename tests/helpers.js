// tests/helpers.js - Balanced version to reduce failures
const { expect } = require('@playwright/test');

const BASE_URL = 'https://www.swifttranslator.com/';

async function convertAndGetOutput(page, inputText) {
  await page.goto(BASE_URL, { 
    waitUntil: 'networkidle', 
    timeout: 60000 
  });

  const switchLocator = page.getByText('Switch Typing Language', { exact: false });
  let switched = false;
  if (await switchLocator.count() > 0 && await switchLocator.isVisible({ timeout: 5000 })) {
    console.log('Switch visible → clicking once');
    await switchLocator.click({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    switched = true;
  }

  
  let input;
  try {
    input = page.getByPlaceholder(/singlish/i);
    await input.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    try {
      input = page.getByLabel(/singlish/i);
      await input.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      input = page.locator('textarea').first(); // prefer textarea
      await input.waitFor({ state: 'visible', timeout: 15000 });
    }
  }

  await input.fill(inputText);
  await input.press('Enter'); 
  await page.waitForTimeout(4000); 


  let outputText = '';
  const candidates = [
    page.locator('textarea').nth(1), 
    page.getByLabel(/sinhala/i),
    page.getByPlaceholder(/sinhala/i),
    page.locator('div[contenteditable="true"]').nth(1),
    page.locator('div, p, span').filter({ hasText: /[\u0D80-\u0DFF]/ }).first()
  ];

  for (const loc of candidates) {
    try {
      const text = await loc.innerText({ timeout: 6000 });
      if (text.trim() && /[\u0D80-\u0DFF]/.test(text)) {
        outputText = text.trim();
        console.log('Output captured from candidate');
        break;
      }
    } catch {}
  }

  if (!/[\u0D80-\u0DFF]/.test(outputText)) {
    console.log('Fallback triggered - scanning body');
    const bodyText = await page.innerText('body');
    const sinhalaMatch = bodyText.match(/[\u0D80-\u0DFF\s\.,!?“”‘’…()'-]+/g);
    if (sinhalaMatch && sinhalaMatch.length > 0) {
      outputText = sinhalaMatch.join(' ');
    }
  }


  if (switched && !/[\u0D80-\u0DFF]/.test(outputText) && await switchLocator.isVisible()) {
    console.log('No Sinhala after switch → flipping back');
    await switchLocator.click().catch(() => {});
    await page.waitForTimeout(1500);
  
    for (const loc of candidates) {
      try {
        const text = await loc.innerText({ timeout: 3000 });
        if (text.trim() && /[\u0D80-\u0DFF]/.test(text)) {
          outputText = text.trim();
          break;
        }
      } catch {}
    }
  }

  console.log('Final output for input:', inputText.slice(0, 50) + '... → ', outputText.slice(0, 100));
  return outputText;
}

module.exports = { convertAndGetOutput };