async function provisionPanelServer(payload) {
  const url = process.env.PANEL_API_URL;
  const apiKey = process.env.PANEL_API_KEY;

  if (!url || !apiKey || url.includes('example.com')) {
    return {
      skipped: true,
      message: 'Panel API is not configured. Order saved locally only.'
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`Panel API failed: ${res.status} ${JSON.stringify(data)}`);
  }

  return data;
}

module.exports = { provisionPanelServer };
