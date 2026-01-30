const { test, expect } = require('@playwright/test');
const { convertAndGetOutput } = require('./helpers');

test.describe('Negative Functional Tests - Singlish to Sinhala Conversion', () => {

  function assertNegativeBehavior(output, forbiddenPhrases = [], minSinhalaChars = 3) {
   
    expect(output).toMatch(new RegExp(`[\\u0D80-\\u0DFF].{${minSinhalaChars - 1},}`));

    
    for (const phrase of forbiddenPhrases) {
      expect(output).not.toContain(phrase);
    }

    
    expect(output.trim()).not.toBe('');
  }

  test('Neg_Fun_0001 – Severe spelling errors', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'apigedhra ynavaa');
    assertNegativeBehavior(output, [
      'අපිගෙදර යනවා',
      'අපි ගෙදර යනවා'
    ]);
  });

  test('Neg_Fun_0002 – Mixed Sinhala + Singlish input', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'sunil ගෙදර yanavaa');
    
    
    expect(output).toMatch(/[\u0D80-\u0DFF]/);           
    expect(output).toContain('සුනිල්');                  
    expect(output.length).toBeGreaterThan(10);          
    
    console.log('Neg_Fun_0002 output (partial expected):', output);
  });

  test('Neg_Fun_0003 – Ambiguous joined words', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mamagedharainnee');
    assertNegativeBehavior(output, [
      'මම ගෙදර ඉන්නේ',
      'මමගෙදරඉන්නේ'
    ]);
  });

  test('Neg_Fun_0004 – Numeric-heavy sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama Rs. 2500 7.30 AM office gihin meeting eka attend kala');
    assertNegativeBehavior(output, [
      'මම රු. 2500 7.30 ප.ව. ඔෆිස් ගිහින් මීටිං එක ඇටෙන්ඩ් කළා'
    ]);
    expect(output).toMatch(/Rs\.|2500|7\.30/); 
  });

  test('Neg_Fun_0005 – Informal command chain', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'ehema karapan passe eka dhenna ithin balamu');
    assertNegativeBehavior(output, [
      'එහෙම කරපන් පස්සේ එක දෙන්න ඉතින් බලමු'
    ]);
  });

  test('Neg_Fun_0006 – Place names with phonetic ambiguity', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'api NuwaraEliya yamu');
    assertNegativeBehavior(output, [
      'අපි නුවරඑළිය යමු',
      'අපි නුවර එළිය යමු'
    ]);
  });

  test('Neg_Fun_0007 – Complex negation + condition', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'oyaa enne naehae nam api gedhara yanne naehae kiyala hithala inne');
    assertNegativeBehavior(output, [
      'ඔයා එන්නේ නැහැ නම් අපි ගෙදර යන්නේ නැහැ කියලා හිතලා ඉන්නේ'
    ]);
  });

  test('Neg_Fun_0008 – Heavy mixed English technical content', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama adha office meeting eka Zoom platform ekee join venna email ekee link eka click karalaa join venna oonee');
    assertNegativeBehavior(output, [
      'මම අද ඔෆිස් මීටිං එක Zoom platform එකේ join වෙන්න email එකේ link එක click කරලා join වෙන්න ඕනේ'
    ]);
   
    const englishCount = (output.match(/\b(Zoom|email|link|click|join|office|meeting|platform)\b/gi) || []).length;
    expect(englishCount).toBeGreaterThan(4);
  });

  test('Neg_Fun_0009 – Repeated emphasis overload', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'hari hari hari hari hondai');
    
    
    expect(output).toMatch(/[\u0D80-\u0DFF]/);           
    expect(output.length).toBeGreaterThan(5);            
    
    
    
    console.log('Neg_Fun_0009 output (awkward expected):', output);
  });

  test('Neg_Fun_0010 – Mixed tense in one sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama iiyee gedhara giyaa saha heta aye enavaa');
    assertNegativeBehavior(output, [
      'මම ඊයේ ගෙදර ගියා සහ හෙට අයේ එනවා'
    ]);
  });

});