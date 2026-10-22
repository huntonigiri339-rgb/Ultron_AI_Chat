// This is the next step after the local keyword bot. Keep it on a server route,
// not in the browser, so MANUS_API_KEY (or another provider key) stays private.
const SYSTEM_INSTRUCTION = `You are a patient AI tutor. Explain ideas in short,
concrete steps. If you are unsure, say so instead of inventing an answer.`;

async function askLanguageModel(conversation) {
  const messages = [
    // The system message sets behavior for the whole conversation.
    { role: 'system', content: SYSTEM_INSTRUCTION },
    // These are the earlier turns plus the newest user message: multi-turn context.
    ...conversation
  ];

  const response = await fetch(`${process.env.MANUS_API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MANUS_API_KEY}`
    },
    body: JSON.stringify({ messages })
  });

  const body = await response.json();
  if (body.error) throw new Error(body.error.message || 'Model request failed');

  // The model generates text; it does not automatically save memory for us.
  return body.choices?.[0]?.message?.content || 'The model returned no text.';
}
