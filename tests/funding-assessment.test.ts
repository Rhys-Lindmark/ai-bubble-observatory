import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fundingAssessment } from '../lib/funding-assessment.ts';
test('funding copy follows shrinking, recovering and deficit cases', () => {
  assert.equal(
    fundingAssessment(82, 100, 61, 100).headline,
    'A shrinking cash cushion.',
  );
  assert.equal(
    fundingAssessment(60, 100, 82, 100).headline,
    'A growing cash cushion.',
  );
  assert.equal(
    fundingAssessment(110, 100, 82, 100).headline,
    'A cash funding gap.',
  );
  assert.equal(fundingAssessment(60, 100, 82, 100).ratioDirection, 'Down from');
});
test('absolute cushion and spending share can move in opposite directions', () => {
  const x = fundingAssessment(150, 200, 60, 100);
  assert.equal(x.headline, 'A growing cash cushion.');
  assert.equal(x.ratioDirection, 'Up from');
});
