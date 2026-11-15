const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const modulePath = fs.existsSync(path.join(__dirname, '../source/legacy-promise.js'))
  ? '../source/legacy-promise.js' : '../legacy-promise.js';
const LegacyPromise = require(modulePath);
test('legacy generators preserve context, return values, and rejected-yield handling', async () => {
  const fn = LegacyPromise.coroutine(function* (value) {
    const doubled = yield Promise.resolve(value * 2);
    try { yield Promise.reject(new Error('expected')); } catch (error) { return this.base + doubled + error.message.length; }
  });
  assert.equal(await fn.call({ base: 5 }, 3), 19);
});
test('legacy generators propagate uncaught asynchronous errors', async () => {
  const fn = LegacyPromise.coroutine(function* () { yield Promise.reject(new Error('failure')); });
  await assert.rejects(fn(), /failure/);
});
test('asynchronous filtering preserves order and rejects failed predicates', async () => {
  assert.deepEqual(await LegacyPromise.filter([1, 2, 3, 4], async value => value % 2 === 0), [2, 4]);
  await assert.rejects(LegacyPromise.filter([1], async () => { throw new Error('failure'); }), /failure/);
});
