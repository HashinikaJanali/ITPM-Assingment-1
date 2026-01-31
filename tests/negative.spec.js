const { test, expect } = require('@playwright/test');
const { convertAndGetOutput } = require('./helpers');

test.describe('Negative Functional Tests - Singlish to Sinhala Conversion', () => {

  // For most negative cases: expect NO or VERY LITTLE Sinhala output
  function assertBadConversion(output, allowSomeSinhala = false) {
    if (!allowSomeSinhala) {
      // Strict: no Sinhala characters at all
      expect(output).not.toMatch(/[\u0D80-\u0DFF]/);
    } else {
      // Allow very little / broken Sinhala
      const sinhalaCount = (output.match(/[\u0D80-\u0DFF]/g) || []).length;
      expect(sinhalaCount).toBeLessThan(10); // very few chars
    }

    // Output should not be a meaningful sentence
    expect(output.trim()).not.toBe('');
  }

  test('Neg_Fun_0001 – Severe spelling errors', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'apigedhra ynavaa');
    assertBadConversion(output); // expect no proper Sinhala
  });

  test('Neg_Fun_0002 – Mixed Sinhala + Singlish input', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'sunil ගෙදර yanavaa');
    assertBadConversion(output, true); // allow very partial/broken
    expect(output).toContain('සුනිල්'); // English name should stay
  });

  test('Neg_Fun_0003 – Ambiguous joined words', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mamagedharainnee');
    assertBadConversion(output); // expect broken segmentation / no good output
  });

  test('Neg_Fun_0004 – Numeric-heavy sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama Rs. 2500 7.30 AM office gihin meeting eka attend kala');
    assertBadConversion(output, true); // numbers stay, Sinhala minimal/wrong
    expect(output).toMatch(/Rs\.|2500|7\.30/);
  });

  test('Neg_Fun_0005 – Informal command chain', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'ehema karapan passe eka dhenna ithin balamu');
    assertBadConversion(output); // order/logic lost → bad output
  });

  test('Neg_Fun_0006 – Place names with phonetic ambiguity', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'api NuwaraEliya yamu');
    assertBadConversion(output); // wrong phonetic split
  });

  test('Neg_Fun_0007 – Complex negation + condition', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'oyaa enne naehae nam api gedhara yanne naehae kiyala hithala inne');
    assertBadConversion(output); // negation mapping wrong
  });

  test('Neg_Fun_0008 – Heavy mixed English technical content', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama adha office meeting eka Zoom platform ekee join venna email ekee link eka click karalaa join venna oonee');
    assertBadConversion(output, true); // English should dominate
    const englishCount = (output.match(/\b(Zoom|email|link|click|join|office|meeting|platform)\b/gi) || []).length;
    expect(englishCount).toBeGreaterThan(4);
  });

  test('Neg_Fun_0009 – Repeated emphasis overload', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'hari hari hari hari hondai');
    assertBadConversion(output); // expect awkward / incomplete repetition
  });

  test('Neg_Fun_0010 – Mixed tense in one sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama iiyee gedhara giyaa saha heta aye enavaa');
    assertBadConversion(output); // tense inconsistency → bad mapping
  });

});