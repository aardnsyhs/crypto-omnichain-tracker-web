const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ApiClient,
  createApiClient,
  isIntentionalCancellation,
} = require('../.test-build/api-client.js');
const { isValidChain, isValidTransactionHash } = require('../.test-build/validation.js');

test('first-load history and deep link wait for one shared signed-session bootstrap', async () => {
  const calls = [];
  let release;
  global.fetch = async (url, options) => {
    calls.push([url, options]);
    if (url.endsWith('/session')) {
      await new Promise((resolve) => {
        release = resolve;
      });
      return new Response(null, { status: 204 });
    }
    return Response.json({ data: [] });
  };
  const client = new ApiClient('https://first-load.example');
  const other = new ApiClient('https://first-load.example');
  const history = client.getHistory();
  const lookup = other.lookupTransaction({
    chain: 'ethereum',
    transactionHash: '0x' + 'a'.repeat(64),
  });
  await Promise.resolve();
  assert.equal(calls.length, 1);
  release();
  await Promise.all([history, lookup]);
  assert.equal(calls.length, 3);
  assert.equal(calls[0][1].credentials, 'include');
});

test('overview does not issue or send session cookies', async () => {
  global.fetch = async (url, options) => {
    assert.ok(url.endsWith('/overview'));
    assert.equal(options.credentials, 'omit');
    return Response.json({ data: [] });
  };
  await new ApiClient('https://overview.example').getOverview();
});

test('hung requests time out', async () => {
  global.fetch = async (_, { signal }) =>
    new Promise((resolve, reject) =>
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
    );
  await assert.rejects(
    new ApiClient('https://timeout.example', 10).getOverview(),
    (error) => error.errorCode === 'REQUEST_TIMEOUT',
  );
});

test('the deadline covers response body reads', async () => {
  global.fetch = async (_, { signal }) => ({
    ok: true,
    status: 200,
    json: () =>
      new Promise((resolve, reject) =>
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
      ),
  });
  await assert.rejects(
    new ApiClient('https://body-timeout.example', 10).getOverview(),
    (error) => error.errorCode === 'REQUEST_TIMEOUT',
  );
});

test('intentional cancellation is distinguishable from a network failure', async () => {
  global.fetch = async (_, { signal }) =>
    new Promise((resolve, reject) =>
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
    );
  const controller = new AbortController();
  const request = new ApiClient('https://cancel.example').getOverview(controller.signal);
  controller.abort();
  await assert.rejects(request, isIntentionalCancellation);
});

test('session bootstrap failures can be retried', async () => {
  let attempt = 0;
  global.fetch = async () => {
    if (++attempt === 1) throw new Error('offline');
    return new Response(null, { status: 204 });
  };
  const client = new ApiClient('https://retry-session.example');
  await assert.rejects(client.initializeSession());
  await client.initializeSession();
  assert.equal(attempt, 2);
});

test('production does not fall back to localhost', () => {
  const old = process.env.NODE_ENV;
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  process.env.NODE_ENV = 'production';
  delete process.env.NEXT_PUBLIC_API_BASE_URL;
  assert.throws(() => createApiClient(), /NEXT_PUBLIC_API_BASE_URL/);
  if (old === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = old;
  if (url !== undefined) process.env.NEXT_PUBLIC_API_BASE_URL = url;
});

test('deep links accept active and legacy lookups with family-specific hashes', () => {
  assert.equal(isValidChain('bitcoin'), true);
  assert.equal(isValidTransactionHash('a'.repeat(64), 'bitcoin'), true);
  assert.equal(isValidChain('bsc'), true);
  assert.equal(isValidTransactionHash('0x' + 'a'.repeat(64), 'bsc'), true);
  assert.equal(isValidTransactionHash('0x' + 'a'.repeat(64), 'bitcoin'), false);
});

test('obsolete lookups cancel immediately while the shared session bootstrap completes', async () => {
  let release;
  const calls = [];
  global.fetch = async (url) => {
    calls.push(url);
    if (url.endsWith('/session')) {
      await new Promise((resolve) => {
        release = resolve;
      });
      return new Response(null, { status: 204 });
    }
    return Response.json({ data: [] });
  };
  const client = new ApiClient('https://cancel-bootstrap.example');
  const controller = new AbortController();
  const lookup = client.lookupTransaction(
    { chain: 'ethereum', transactionHash: '0x' + 'a'.repeat(64) },
    controller.signal,
  );
  const history = client.getHistory();
  controller.abort();
  await assert.rejects(lookup, isIntentionalCancellation);
  assert.equal(calls.length, 1);
  release();
  await history;
  assert.equal(calls.filter((url) => url.endsWith('/lookup')).length, 0);
  assert.equal(calls.length, 2);
});
