# LLM integration guide

The browser app is intentionally model-free. To connect a language model, add a server route and keep credentials there.

## Request contract

The built-in Manus LLM surface is OpenAI-compatible:

```text
POST $MANUS_API_URL/v1/chat/completions
Authorization: Bearer $MANUS_API_KEY
Content-Type: application/json
```

The request body contains a `messages` array. A typical request for this lesson is:

```js
{
  messages: [
    {
      role: 'system',
      content: 'You are a patient AI tutor. Explain ideas in short, concrete steps. If unsure, say so.'
    },
    { role: 'user', content: 'What is a token?' },
    { role: 'assistant', content: 'Tokens are small chunks of text...' },
    { role: 'user', content: 'Why do they matter?' }
  ]
}
```

The assistant response is normally read from `choices[0].message.content`. Always inspect an `error` object before indexing `choices`, and handle an empty response explicitly.

## Minimal server handler

This example is intentionally separate from `server.js`, which remains a static file server for the beginner lesson:

```js
async function completeChat(conversation) {
  const messages = [
    {
      role: 'system',
      content: 'You are a patient AI tutor. Explain ideas in short, concrete steps. If unsure, say so.'
    },
    ...conversation.filter(({ role }) => role === 'user' || role === 'assistant')
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
  if (!response.ok || body.error) {
    throw new Error(body.error?.message || `LLM request failed with ${response.status}`);
  }

  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error('The LLM returned no text.');
  return content;
}
```

## Browser-to-server shape

A production browser request could look like this:

```js
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ conversation })
});

const { reply } = await response.json();
```

The server validates the input, adds the system instruction, calls the model, and returns only the text needed by the browser. It should also apply rate limits, request-size limits, timeouts, and logging that avoids storing secrets.

## Grounding the answer

A model predicts likely language; it does not automatically verify facts. For a dedicated knowledge source, retrieve relevant trusted passages first and include them in the request as clearly marked context. Then ask the model to answer only from those passages and to say when the passages do not contain an answer.

Do not treat retrieval as a guarantee. Validate citations, watch for prompt injection inside documents, and keep the original source available for inspection.

## Environment variables

Copy `.env.example` to your server environment only. Never commit a populated `.env` file.

- `MANUS_API_URL`: the runtime API base URL.
- `MANUS_API_KEY`: a server-side credential.

If you use another provider, keep the same separation: provider credentials stay server-side and the browser calls your own route.
