'use strict';

process.env.MNOTIFY_API_KEY = 'test-api-key';
process.env.MNOTIFY_SENDER_ID = 'COPNewRoad';

const { isMnotifyConfigured, sendViaMnotify } = require('../../src/services/sms');
const env = require('../../src/config/env');
const originalFetch = global.fetch;
const originalMnotifyConfig = { ...env.mnotify };

describe('mNotify SMS integration', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Object.assign(env.mnotify, originalMnotifyConfig);
  });

  test('sends the documented quick-SMS payload and recognizes provider success', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ status: 'success', code: '2000' }),
    });

    const result = await sendViaMnotify('0241234567', 'Hello there');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.mnotify.com/api/sms/quick?key=test-api-key',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: ['0241234567'],
          sender: 'COPNewRoad',
          message: 'Hello there',
          is_schedule: false,
          schedule_date: '',
        }),
      }
    );
    expect(result).toMatchObject({ ok: true, status: 200 });
  });

  test('does not count an HTTP 200 provider error response as a sent SMS', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ status: 'error', message: 'Invalid sender' }),
    });

    await expect(sendViaMnotify('0241234567', 'Hello there')).resolves.toMatchObject({
      ok: false,
      status: 200,
    });
  });

  test('requires both the API key and sender ID to enable delivery', () => {
    expect(isMnotifyConfigured()).toBe(true);
    env.mnotify.senderId = '';
    expect(isMnotifyConfigured()).toBe(false);
    env.mnotify.senderId = 'COPNewRoad';
    env.mnotify.apiKey = '';
    expect(isMnotifyConfigured()).toBe(false);
  });
});
