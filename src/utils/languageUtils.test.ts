import test from 'node:test';
import assert from 'node:assert/strict';
import { ORVEX_LANGUAGES } from '../i18n/locales/languages';
import {
  filterLanguages,
  getLanguageByCode,
  getTextDirection,
  isRtlLanguage,
  resolveInitialLanguage,
} from './languageUtils';

test('includes English plus all 22 Scheduled Indian Languages (23 total)', () => {
  assert.equal(ORVEX_LANGUAGES.length, 23);
  const scheduledCount = ORVEX_LANGUAGES.filter((l) => l.isScheduledIndianLanguage).length;
  assert.equal(scheduledCount, 22);
});

test('Urdu resolves to RTL and English/Tamil/Hindi resolve to LTR', () => {
  assert.equal(getTextDirection('ur'), 'rtl');
  assert.equal(isRtlLanguage('ur'), true);
  assert.equal(getTextDirection('en'), 'ltr');
  assert.equal(getTextDirection('ta'), 'ltr');
  assert.equal(getTextDirection('hi'), 'ltr');
  assert.equal(isRtlLanguage('en'), false);
});

test('resolveInitialLanguage falls back to English for unknown values', () => {
  assert.equal(resolveInitialLanguage(null), 'en');
  assert.equal(resolveInitialLanguage('xx'), 'en');
  assert.equal(resolveInitialLanguage('ta'), 'ta');
  assert.equal(resolveInitialLanguage('ur'), 'ur');
});

test('filterLanguages matches English name, native script, and ISO code', () => {
  assert.equal(filterLanguages('Tamil').length, 1);
  assert.equal(filterLanguages('தமிழ்')[0]?.code, 'ta');
  assert.equal(filterLanguages('اردو')[0]?.code, 'ur');
  assert.equal(filterLanguages('kn')[0]?.code, 'kn');
  assert.equal(filterLanguages('nonexistent-xyz').length, 0);
  assert.equal(getLanguageByCode('unknown').code, 'en');
});
