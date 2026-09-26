import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { Server } from 'node:http';
import { app } from '../server.ts';

let server: Server;
let baseUrl: string;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve, reject) => {
    server.once('listening', () => resolve());
    server.once('error', reject);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not expose a TCP address');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test('health endpoint reports VELORA platform state', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  const body = (await response.json()) as Record<string, unknown>;
  assert.equal(body.status, 'ok');
  assert.equal(body.platform, 'VELORA');
  assert.equal(body.persistence, 'server-file-per-client');
  assert.equal(typeof body.engine, 'string');
});

test('auth endpoints support registration, login, and profile lookup', async () => {
  const testEmail = `creator_${Date.now()}@velora.pub`;
  const testPass = 'VeloraSecure2026!';
  const testName = 'Helena Thorne';

  // 1. Register new user
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPass,
      name: testName,
      penName: 'H. Thorne',
      imprintName: 'Thorne Editions'
    })
  });
  assert.equal(regRes.status, 201);
  const regBody = (await regRes.json()) as { token: string; user: { id: string; email: string; name: string } };
  assert.ok(regBody.token);
  assert.equal(regBody.user.email, testEmail);
  assert.equal(regBody.user.name, testName);

  // 2. Login with valid credentials
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPass
    })
  });
  assert.equal(loginRes.status, 200);
  const loginBody = (await loginRes.json()) as { token: string; user: { id: string; email: string } };
  assert.ok(loginBody.token);
  assert.equal(loginBody.user.email, testEmail);

  // 3. Reject invalid password
  const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'wrong_password_123'
    })
  });
  assert.equal(badLogin.status, 401);

  // 4. Fetch authenticated user profile via Bearer token
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${loginBody.token}` }
  });
  assert.equal(meRes.status, 200);
  const meBody = (await meRes.json()) as { user: { id: string; email: string } };
  assert.equal(meBody.user.id, regBody.user.id);
});

test('state endpoint rejects missing client identity', async () => {
  const response = await fetch(`${baseUrl}/api/state`);
  assert.equal(response.status, 400);
  const body = (await response.json()) as { error?: string };
  assert.equal(body.error, 'Invalid client id');
});

test('state endpoint rejects malformed client identity', async () => {
  const response = await fetch(`${baseUrl}/api/state`, {
    headers: { 'X-Client-Id': 'not-a-uuid' }
  });
  assert.equal(response.status, 400);
  const body = (await response.json()) as { error?: string };
  assert.equal(body.error, 'Invalid client id');
});

test('state endpoint persists and returns a client snapshot', async () => {
  const clientId = '00000000-0000-4000-8000-000000000002';
  const snapshot = {
    activeProject: { id: 'test-project', title: 'Persistence Test' },
    allProjects: [{ id: 'test-project', title: 'Persistence Test' }],
    platformConfig: { brandName: 'VELORA' }
  };

  const saveResponse = await fetch(`${baseUrl}/api/state`, {
    method: 'PUT',
    headers: {
      'X-Client-Id': clientId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(snapshot)
  });
  assert.equal(saveResponse.status, 204);

  const readResponse = await fetch(`${baseUrl}/api/state`, {
    headers: { 'X-Client-Id': clientId }
  });
  assert.equal(readResponse.status, 200);
  assert.deepEqual(await readResponse.json(), snapshot);
});

test('generate-image endpoint produces an illustration payload', async () => {
  const response = await fetch(`${baseUrl}/api/orchestrator/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'A solitary lighthouse under starry twilight',
      style: 'Atmospheric Nordic Noir',
      title: 'The Northern Beacon',
      chapterNumber: 1,
      target: 'illustration'
    })
  });
  assert.equal(response.status, 200);
  const body = (await response.json()) as { imageUrl?: string; prompt?: string; chapterNumber?: number };
  assert.equal(typeof body.imageUrl, 'string');
  assert.ok(body.imageUrl?.startsWith('data:image/svg+xml'));
  assert.equal(body.chapterNumber, 1);
});

test('orchestrator endpoints succeed in zero-cost free mode', async () => {
  // 1. Analyze intent free
  const intentRes = await fetch(`${baseUrl}/api/orchestrator/analyze-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idea: 'En mystisk fiskerlandsby på Helgelandskysten skjuler en gammel hemmelighet',
      contentType: 'book',
      language: 'Norwegian'
    })
  });
  assert.equal(intentRes.status, 200);
  const intent = (await intentRes.json()) as { title: string; genre: string };
  assert.ok(intent.title);
  assert.ok(intent.genre);

  // 2. Build plan & bible free
  const planRes = await fetch(`${baseUrl}/api/orchestrator/build-plan-bible`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: intent.title,
      rawIdea: 'En fisker forsvinner i tåken',
      chapterCount: 3,
      intent,
      language: 'Norwegian'
    })
  });
  assert.equal(planRes.status, 200);
  const planData = (await planRes.json()) as { plan: { chaptersPlan: any[] }; bible: any };
  assert.equal(planData.plan.chaptersPlan.length, 3);
  assert.ok(planData.bible.characters.length > 0);

  // 3. Generate chapter prose free
  const chapterRes = await fetch(`${baseUrl}/api/orchestrator/generate-chapter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectTitle: intent.title,
      chapterPlan: planData.plan.chaptersPlan[0],
      bible: planData.bible,
      language: 'Norwegian'
    })
  });
  assert.equal(chapterRes.status, 200);
  const chapterData = (await chapterRes.json()) as { prose: string; wordCount: number };
  assert.ok(chapterData.prose.length > 200);
  assert.ok(chapterData.wordCount > 50);
});
