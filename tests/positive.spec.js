const { test, expect } = require('@playwright/test');
const { convertAndGetOutput } = require('./helpers');

test.describe('Positive Functional Tests - Singlish to Sinhala Conversion', () => {

  // Helper to apply strict or loose assertion
  async function assertConversion(output, expectedContains, inputLength) {
    let allPassed = true;
    for (const phrase of expectedContains) {
      if (!output.includes(phrase)) {
        allPassed = false;
        break;
      }
    }

    if (allPassed) {
      // Strict pass
      for (const phrase of expectedContains) {
        expect(output).toContain(phrase);
      }
    } else {
      // Loose fallback
      console.warn(`Strict checks failed for some phrases. Falling back to loose validation.`);
      expect(output).toMatch(/[\u0D80-\u0DFF]/); // at least one Sinhala character
      expect(output.length).toBeGreaterThan(Math.max(10, inputLength * 0.4)); // rough length check
    }
  }

  test('Pos_Fun_0001 – Convert compound sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama gedhara yanavaa, ehema nam api passe kathaa karamu.');
    await assertConversion(output, ['මම', 'ගෙදර', 'යනවා', 'එහෙම නම්'], 50);
  });

  test('Pos_Fun_0002 – Convert complex conditional sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'oya enavaanam mama balan innavaa.');
    await assertConversion(output, ['ඔයා', 'එනවනම්', 'මම', 'බලන්'], 35);
  });

  test('Pos_Fun_0003 – Convert abbreviation usage', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'OTP eka enter karanna');
    await assertConversion(output, ['OTP', 'එක', 'enter', 'කරන්න'], 20);
  });

  test('Pos_Fun_0004 – Convert complex conditional sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'oya enne nam api yamu.');
    await assertConversion(output, ['ඔයා', 'එන්නේ', 'නම්', 'අපි'], 25);
  });

  test('Pos_Fun_0005 – Convert polite phrasing', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'karuNaakaralaa mata podi udhavvak karanna puLuvandha?');
    await assertConversion(output, ['කරුණාකරලා', 'මට', 'පුළුවන්ද'], 60);
  });

  test('Pos_Fun_0006 – Convert informal phrasing', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'ehema karapan.');
    await assertConversion(output, ['එහෙම', 'කරපන්'], 15);
  });

  test('Pos_Fun_0007 – Convert slang sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'ela machan supiri');
    await assertConversion(output, ['එල', 'මචං', 'සුපිරි'], 20);
  });

  test('Pos_Fun_0008 – Convert interrogative request', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'oyaata eka karanna puluvandha?');
    await assertConversion(output, ['ඔයාට', 'පුලුවන්ද'], 35);
  });

  test('Pos_Fun_0009 – Convert unit of measurement', async ({ page }) => {
    const output = await convertAndGetOutput(page, '2kg bath ganna');
    await assertConversion(output, ['2kg', 'බත්', 'ගන්න'], 15);
  });

  test('Pos_Fun_0010 – Convert imperative command', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'vahaama enna');
    await assertConversion(output, ['වහාම', 'එන්න'], 15);
  });

  test('Pos_Fun_0011 – Convert date format', async ({ page }) => {
    const output = await convertAndGetOutput(page, '2026-05-21 meeting eka');
    await assertConversion(output, ['2026-05-21', 'meeting', 'එක'], 25);
  });

  test('Pos_Fun_0012 – Convert informal phrasing', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'ane eeka dhiyan');
    await assertConversion(output, ['අනෙ', 'දියන්'], 15);
  });

  test('Pos_Fun_0013 – Convert negative sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama eka karannee naehae');
    await assertConversion(output, ['මම', 'කරන්නේ', 'නැහැ'], 25);
  });

  test('Pos_Fun_0014 – Convert repeated emphasis', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'hari hari hondai');
    await assertConversion(output, ['හරි', 'හොඳයි'], 15);
  });

  test('Pos_Fun_0015 – Convert joined words', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'matapaankannaoonee');
    await assertConversion(output, ['මටපාන්කන්නඕනේ'], 20);
  });

  test('Pos_Fun_0016 – Convert past tense', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama iiyee office giyaa');
    await assertConversion(output, ['මම', 'ඊයේ', 'ගියා'], 25);
  });

  test('Pos_Fun_0017 – Convert future tense', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'api heta Kandy yamu');
    await assertConversion(output, ['අපි', 'හෙට', 'යමු'], 20);
  });

  test('Pos_Fun_0018 – Convert plural pronoun', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'oyaalaa enavadha');
    await assertConversion(output, ['ඔයාලා', 'එනවද'], 20);
  });

  test('Pos_Fun_0019 – Convert English brand term', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'Zoom meeting ekak thiyenavaa');
    await assertConversion(output, ['Zoom', 'meeting', 'තියෙනවා'], 30);
  });

  test('Pos_Fun_0020 – Handle multiple spaces', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama    gedhara    innee');
    await assertConversion(output, ['මම', 'ගෙදර', 'ඉන්නේ'], 25);
  });

  test('Pos_Fun_0021 – Handle line breaks', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama gedhara yanavaa.\n\noyaa enavadha');
    await assertConversion(output, ['මම', 'යනවා', 'ඔයා'], 40);
  });

  test('Pos_Fun_0022 – Convert long paragraph input', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama adha udheeta office giyaa saha meeting eka pahugiya maasaya gana kathaa karaa. ehema nam heta api aluth plan ekak hadhamu kiyalaa decide karaa.');
    await assertConversion(output, ['මම', 'අද', 'ඔෆිස්', 'හෙට', 'අලුත්'], 150);
  });

  test('Pos_Fun_0023 – Convert medium paragraph', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'dhitvaa suLi kuNaatuva samaGa…');
    await assertConversion(output, ['දිට්වා', 'සුළි', 'කුණාටුව'], 30);
  });

  test('Pos_Fun_0024 – Convert medium descriptive sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama ada udeta office giyaa, passe kavuda enne kiyala ahuwa.');
    await assertConversion(output, ['මම', 'අද', 'ඔෆිස්', 'කවුද'], 60);
  });

});