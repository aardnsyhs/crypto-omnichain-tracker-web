const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function main() {
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '53009'], { env: { ...process.env, NODE_ENV: 'production', NEXT_PUBLIC_API_BASE_URL: 'https://api.ardiansyah.app' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = ''; child.stdout.on('data', data => { logs += data; }); child.stderr.on('data', data => { logs += data; });
  try {
    let response;
    for (let i = 0; i < 80; i++) {
      if (child.exitCode !== null) break;
      try { response = await fetch('http://127.0.0.1:53009', { signal: AbortSignal.timeout(2000) }); if (response.ok) break; } catch {}
      await delay(100);
    }
    assert.equal(response?.status, 200, logs);
    assert.match(await response.text(), /Transaction Story Explorer/);
    const linked = await fetch('http://127.0.0.1:53009/?chain=bitcoin&tx=' + 'a'.repeat(64));
    assert.equal(linked.status, 200); assert.match(await linked.text(), /Investigative Ledger/);
    console.log('PASS: production frontend HTTP 200, product metadata, and deep-link URL served. Client effects verified separately through tests and source inspection.');
  } finally { if (child.exitCode === null) { child.kill('SIGTERM'); await once(child, 'exit'); } }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
