import test from 'node:test';
import assert from 'node:assert/strict';
import { getApiRoot } from '../src/utils/apiRoot.js';

// In plain node, import.meta.env is undefined, so the fallback must hold.
test('apiRoot falls back to /api without VITE_API_BASE', () => {
  assert.equal(getApiRoot(), '/api');
});
test('apiRoot returns a string ending in /api', () => {
  assert.ok(getApiRoot().endsWith('/api'));
});
