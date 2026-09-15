import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { optionalPhones, optionalText } from './optionalFields';

describe('optionalText', () => {
  it('turns empty and whitespace into undefined', () => {
    assert.equal(optionalText(''), undefined);
    assert.equal(optionalText('  '), undefined);
    assert.equal(optionalText(undefined), undefined);
    assert.equal(optionalText(null), undefined);
  });

  it('keeps trimmed non-empty text', () => {
    assert.equal(optionalText(' ABC-1 '), 'ABC-1');
  });
});

describe('optionalPhones', () => {
  it('drops empty entries and returns undefined when none remain', () => {
    assert.equal(optionalPhones(['', '  ']), undefined);
    assert.equal(optionalPhones([]), undefined);
  });

  it('keeps filled phone strings', () => {
    assert.deepEqual(optionalPhones(['', '(31) 99999-9999', '  ']), [
      '(31) 99999-9999',
    ]);
  });
});
