# Architecture

## Runtime shape

This is a static frontend served by a minimal Node HTTP server. There is no database, login system, build step, or frontend framework.

```text
browser
  │
  ├─ index.html + styles.css
  └─ app.js
       │
       ├─ conversation[]  ← short-term app-managed context
       ├─ findRule()      ← transparent keyword matching
       └─ renderContext() ← visible context and token estimate

server.js
  └─ serves the files on PORT (default: 3000)
```

## Turn lifecycle

1. The learner submits the form in `index.html`.
2. `handleSubmit()` reads and trims the input.
3. The new message is appended as `{ role: 'user', content }`.
4. Rule-based mode calls `findRule()`.
5. The first matching rule returns a reply and a teaching label.
6. The reply is appended as an assistant turn.
7. `renderMessages()` updates the chat transcript.
8. `renderContext()` updates the turn count, rough token count, and code-like context panel.

Model-shaped mode deliberately uses the same UI and conversation state but returns an explanatory placeholder. This makes the boundary between the working demo and a real model request obvious.

## Main data structures

### Conversation

```js
const conversation = [
  { role: 'assistant', content: '...', source: 'welcome' },
  { role: 'user', content: 'What is a token?' },
  { role: 'assistant', content: '...', lesson: 'matched rule: tokens' }
];
```

The first two fields are compatible with common chat-completions APIs. The extra `lesson` field is local UI metadata and should be removed or transformed before sending to a provider.

### Rules

```js
{
  id: 'tokens',
  keywords: ['token', 'tokens'],
  reply: '...',
  lesson: 'matched rule: tokens'
}
```

Rules are ordered. If a message could match more than one rule, the earlier rule wins. This is a useful teaching constraint because it makes priority visible.

## Safe extension points

- Add a rule to `RULES` and test it in the playground.
- Replace substring matching with a small intent classifier.
- Add a server endpoint that accepts the newest turn and conversation.
- Keep the server-side model key in an environment variable.
- Add a retrieval step that selects trusted excerpts before calling the model.
- Add citations and an uncertainty state to model responses.

## Deliberate limitations

The token count is only a word-based approximation. Exact token counts depend on the selected model tokenizer. The static server does not implement an LLM endpoint. The `llm-client.example.js` file is an integration reference, not a live provider call.
