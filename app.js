/*
 * AI Basics Chatbot Lab
 *
 * This file deliberately keeps the first chatbot small and readable.
 * 1. The UI collects a message.
 * 2. handleSubmit stores it in `conversation`.
 * 3. findRule() scans keywords and returns a reply.
 * 4. renderMessages() draws both sides of the conversation.
 *
 * A real language-model version would replace findRule() with a server call.
 * The separate llm-client.example.js file shows that next step with comments.
 */

// The conversation array is our app's short-term memory. A model would receive
// this same array on every turn because models do not automatically remember it.
const conversation = [
  { role: 'assistant', content: 'Hi! I’m a tiny rule-based tutor. Ask me about language models, prompts, tokens, context, or hallucinations.', source: 'welcome' }
];

// These are the bot's explicit rules. The first keyword match wins.
const RULES = [
  {
    id: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'start'],
    reply: 'Hello! Try asking “What is a token?” or “How does context work?”',
    lesson: 'matched rule: greeting'
  },
  {
    id: 'language-model',
    keywords: ['language model', 'llm', 'what is ai', 'what is a model'],
    reply: 'A language model predicts likely next pieces of text from patterns it learned. This demo uses rules instead, so its answers are fully predictable.',
    lesson: 'matched rule: language-model'
  },
  {
    id: 'prompt',
    keywords: ['prompt', 'system instruction', 'system message'],
    reply: 'A prompt is the task you send. A system instruction sets the bot’s overall behavior, like “be a patient tutor.” Look for role: system in the model-shaped code below.',
    lesson: 'matched rule: prompt'
  },
  {
    id: 'tokens',
    keywords: ['token', 'tokens'],
    reply: 'Tokens are small chunks of text that models read. The rough token counter on the right is here to make that invisible step visible.',
    lesson: 'matched rule: tokens'
  },
  {
    id: 'context',
    keywords: ['context', 'memory', 'remember', 'conversation'],
    reply: 'Context is the earlier conversation you send along with the new message. In this app, inspect the conversation array on the right: that is the memory we chose to carry.',
    lesson: 'matched rule: context'
  },
  {
    id: 'hallucination',
    keywords: ['hallucination', 'make things up', 'wrong', 'confident'],
    reply: 'A model can generate plausible language without checking whether it is true. Add a trusted knowledge source, citations, and an “I’m not sure” path to reduce that risk.',
    lesson: 'matched rule: hallucination'
  },
  {
    id: 'next-steps',
    keywords: ['next', 'persona', 'knowledge source', 'upgrade'],
    reply: 'Next steps: change SYSTEM_INSTRUCTION to give the bot a persona, then add a search step that supplies trusted notes as context.',
    lesson: 'matched rule: next-steps'
  }
];

const FALLBACK = {
  reply: 'I don’t have a rule for that yet. Try “What is a token?”, “How does context work?”, or “Why can AI make things up?”',
  lesson: 'fallback: no keyword matched'
};

const SYSTEM_INSTRUCTION = 'You are a patient AI tutor. Explain ideas in short, concrete steps. If unsure, say so.';
const llmExample = `// On your server, keep the key private.
const messages = [
  { role: "system", content: SYSTEM_INSTRUCTION },
  ...conversation,
  { role: "user", content: newestMessage }
];

const response = await fetch("/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: "Bearer $MANUS_API_KEY" },
  body: JSON.stringify({ messages })
});

const answer = (await response.json()).choices[0].message.content;`;

const elements = {
  messages: document.querySelector('#messages'),
  contextCode: document.querySelector('#context-code'),
  turnCount: document.querySelector('#turn-count'),
  tokenCount: document.querySelector('#token-count'),
  form: document.querySelector('#chat-form'),
  input: document.querySelector('#message-input'),
  reset: document.querySelector('#reset-chat'),
  modeNote: document.querySelector('#mode-note'),
  llmCode: document.querySelector('#llm-code'),
  comfortResponse: document.querySelector('#comfort-response')
};

let mode = 'rules';

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

// This intentionally rough estimate illustrates that text becomes tokens.
// Production apps use the tokenizer for the exact model they selected.
function estimateTokens(text) {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.3));
}

function findRule(message) {
  const normalized = message.toLowerCase();
  return RULES.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword))) || FALLBACK;
}

function renderMessages() {
  elements.messages.innerHTML = conversation.map((message) => {
    const isUser = message.role === 'user';
    const label = isUser ? 'YOU' : 'BOT';
    const meta = isUser ? 'your prompt' : (message.lesson || 'assistant reply');
    return `<article class="message ${isUser ? 'user' : 'assistant'}">
      <div class="avatar" aria-hidden="true">${label === 'YOU' ? '↑' : 'AI'}</div>
      <div>
        <div class="bubble">${escapeHtml(message.content)}</div>
        <div class="message-meta"><span>${label}</span><span class="source-tag">${escapeHtml(meta)}</span></div>
      </div>
    </article>`;
  }).join('');
  elements.messages.scrollTop = elements.messages.scrollHeight;
}

function renderContext() {
  const contextText = conversation.map((message) => message.content).join(' ');
  elements.turnCount.textContent = conversation.length;
  elements.tokenCount.textContent = `~${estimateTokens(contextText)}`;
  elements.contextCode.innerHTML = conversation.map((message) => {
    const safeRole = escapeHtml(message.role);
    const safeContent = escapeHtml(message.content);
    return `<span class="role">{ role: "${safeRole}",</span>\n  <span class="string">content: "${safeContent}"</span>\n},`;
  }).join('\n');
}

function appendAssistantReply(message, lesson) {
  conversation.push({ role: 'assistant', content: message, lesson });
}

function handleSubmit(event) {
  event.preventDefault();
  const message = elements.input.value.trim();
  if (!message) return;

  conversation.push({ role: 'user', content: message });
  elements.input.value = '';

  if (mode === 'rules') {
    const result = findRule(message);
    appendAssistantReply(result.reply, result.lesson);
  } else {
    // Model-shaped mode keeps the demo safe: it shows how the same UI would
    // package the turn without pretending that a live model request happened.
    appendAssistantReply('This is a model-shaped preview. The app would send the system instruction plus the conversation array to a server, then render the model’s returned text here.', 'illustrative model response');
  }

  renderMessages();
  renderContext();
}

function setMode(nextMode) {
  mode = nextMode;
  document.querySelectorAll('.mode-button').forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  elements.modeNote.innerHTML = mode === 'rules'
    ? '<span class="mode-note-icon">01</span><span><strong>Rule-based mode:</strong> type a message and the bot scans its rules for keywords. Nothing is hidden.</span>'
    : '<span class="mode-note-icon">02</span><span><strong>Model-shaped mode:</strong> the UI shows where a model response would land. Open the code panel to see the request shape.</span>';
}

function resetChat() {
  conversation.splice(0, conversation.length, {
    role: 'assistant',
    content: 'Hi! I’m a tiny rule-based tutor. Ask me about language models, prompts, tokens, context, or hallucinations.',
    source: 'welcome'
  });
  renderMessages();
  renderContext();
}

elements.form.addEventListener('submit', handleSubmit);
elements.reset.addEventListener('click', resetChat);
elements.llmCode.textContent = llmExample;
document.querySelectorAll('.mode-button').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
document.querySelectorAll('[data-suggestion]').forEach((button) => button.addEventListener('click', () => {
  elements.input.value = button.dataset.suggestion;
  elements.input.focus();
}));
document.querySelectorAll('[data-comfort]').forEach((button) => button.addEventListener('click', () => {
  const messages = {
    new: 'Great starting point. Next, we can trace one function at a time and change a single rule together.',
    some: 'Nice. Next, we can add a new rule, inspect the array, and then make a small server request.',
    comfortable: 'Excellent. Next, we can build the server route, handle errors, and add a grounded knowledge source.'
  };
  elements.comfortResponse.textContent = messages[button.dataset.comfort];
}));

renderMessages();
renderContext();
