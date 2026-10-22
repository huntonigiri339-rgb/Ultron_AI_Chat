# Learning guide

Read the app in this order: `index.html` for the visible lesson, `app.js` for behavior, then `llm-client.example.js` for the model-shaped next step.

## 1. Language models

Start with the language-model concept card in `index.html`. Compare its `reply = model(messages)` idea with `findRule(message)` in `app.js`. The rule bot selects a stored response; a language model generates text from learned patterns.

**Exercise:** Add a new rule for “what is a prompt?” and observe how deterministic the reply is.

## 2. Prompts and system instructions

Find `SYSTEM_INSTRUCTION` in `app.js` and in `llm-client.example.js`. The system instruction defines behavior. A user message supplies the immediate task.

**Exercise:** Change the instruction to “Answer like a concise coach.” In the current rule mode, notice that changing the constant alone does not change replies. That is because only a real model request uses it.

## 3. Tokens

`estimateTokens()` is intentionally approximate. It makes the concept visible without adding a tokenizer dependency.

**Exercise:** Send a short message, then a longer message, and compare the context counter.

## 4. Context

The `conversation` array is the app-managed memory. The model-shaped example spreads it into `messages` with `...conversation`.

**Exercise:** Use the reset button and compare the context panel before and after. Ask a follow-up question and watch the turn count grow.

## 5. Hallucinations

The hallucination rule and warning card explain why fluent text is not proof of truth. A real application can reduce risk with retrieval, citations, validation, and explicit uncertainty.

**Exercise:** Design a reply format that includes `answer`, `sources`, and `confidence`, then decide what the UI should do when `sources` is empty.

## Choose your next depth

- **New to coding:** change one keyword and one reply at a time.
- **Know a little:** add a server route and return a fixed JSON reply before calling a model.
- **Pretty comfortable:** add streaming, rate limiting, retrieval, citations, and automated tests for the fallback path.
