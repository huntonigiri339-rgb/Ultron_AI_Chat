# AI Basics Chatbot Lab

A small, dependency-free educational chatbot that makes the first AI concepts visible.

The app starts with a transparent keyword-matching bot, then shows how the same conversation would be packaged for a language model. It is designed for learners who want to understand the moving parts before adding an API key, framework, database, or retrieval system.

## What this project teaches

- How a browser form turns an input into a chatbot reply.
- How keyword rules and fallback behavior work.
- What a language model is and how it differs from a rule engine.
- The difference between a user prompt and a system instruction.
- Why tokens and conversation context matter.
- Why models can hallucinate and how a knowledge source can help.
- Why model credentials belong on a server rather than in browser JavaScript.

## Features

The playground includes a working rule-based chat mode, visible conversation history, a rough token counter, a model-shaped preview mode, a commented LLM request example, five concise concept cards, and next-step suggestions for adding a persona or trusted knowledge source. It also asks the learner how comfortable they are with coding so the next lesson can be adjusted.

## Run locally


```bash
git clone https://github.com/huntonigiri339-rgb/Ultron_AI_Chat.git
cd Ultron_AI_Chat
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Project map

| File | Purpose |
| --- | --- |
| `index.html` | Accessible page structure, lesson copy, chat form, and code panels. |
| `styles.css` | Responsive visual system and layout. |
| `app.js` | Rule engine, conversation state, token estimate, rendering, and learning interactions. |
| `server.js` | Small static Node server for local development. |
| `llm-client.example.js` | Commented OpenAI-compatible chat-completions example for the next step. |
| `model-routes.json` | Route manifest used by the managed preview environment. |
| `app.config.ts` | Project branding metadata. |
| `docs/ARCHITECTURE.md` | Request-to-reply data flow and extension points. |
| `docs/LLM-INTEGRATION.md` | Safe server-side integration guide and request contract. |
| `docs/LEARNING-GUIDE.md` | Short teaching notes and exercises mapped to the code. |
| `.env.example` | Names of runtime variables an LLM server integration may need. |

## How the rule-based bot works

`app.js` keeps the current conversation in the `conversation` array. Each submitted message is appended as a `user` turn. `findRule()` lowercases the text, scans the ordered `RULES` list, and returns the first rule whose keyword appears. If no rule matches, the `FALLBACK` response is used. The assistant reply is then appended and both the chat and context panel are re-rendered.

This is intentionally simple. The ordered list makes the behavior inspectable, and the fallback makes the failure mode explicit instead of silently inventing an answer.

## Connecting a language model

The app does not call a model by default. That keeps the first lesson safe, free of secrets, and easy to run. The next layer is documented in [`llm-client.example.js`](./llm-client.example.js) and [`docs/LLM-INTEGRATION.md`](./docs/LLM-INTEGRATION.md).

The important shape is:

```js
[
  { role: 'system', content: SYSTEM_INSTRUCTION },
  ...conversation,
  { role: 'user', content: newestMessage }
]
```

A production implementation should send this from a server route. Do not place a provider key in `app.js`, HTML, or any other browser-served file.

## Design and teaching choices

The interface uses a calm editorial layout with a teal learning accent, a coral action accent, and dark code panels. The visual hierarchy follows the lesson sequence: try the behavior, inspect the context, connect the concepts, then choose a next step.

The code favors browser APIs and plain JavaScript so a learner can open the files and trace the entire flow without first learning a framework.

## License

This project is provided as an educational starter. Add the license that best fits your intended reuse before distributing it as a library or product.
