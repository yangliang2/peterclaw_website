(function initAskAI() {
  const root = document.getElementById('ask-ai-root');
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';

  const trigger = document.getElementById('ask-ai-trigger');
  const panel = document.getElementById('ask-ai-panel');
  const closeBtn = document.getElementById('ask-ai-close');
  const form = document.getElementById('ask-ai-form');
  const input = document.getElementById('ask-ai-input');
  const submitBtn = document.getElementById('ask-ai-submit');
  const messages = document.getElementById('ask-ai-messages');

  if (
    !(trigger instanceof HTMLButtonElement) ||
    !(panel instanceof HTMLElement) ||
    !(closeBtn instanceof HTMLButtonElement) ||
    !(form instanceof HTMLFormElement) ||
    !(input instanceof HTMLInputElement) ||
    !(submitBtn instanceof HTMLButtonElement) ||
    !(messages instanceof HTMLElement)
  ) {
    return;
  }

  const locale = root.dataset.locale ?? 'zh';

  function openPanel() {
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    trigger.focus();
  }

  trigger.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closePanel();
  });

  function appendMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = `ask-ai-bubble ask-ai-bubble--${role}`;
    bubble.textContent = text;
    const hint = messages.querySelector('.ask-ai-hint');
    if (hint) hint.remove();
    messages.appendChild(bubble);
    bubble.scrollIntoView({ block: 'end', behavior: 'smooth' });
    return bubble;
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    input.disabled = loading;
    submitBtn.setAttribute('aria-busy', String(loading));
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    appendMessage('user', question);
    setLoading(true);

    const answerBubble = appendMessage('assistant', '…');

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, locale }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const code = errJson.error ?? 'unknown';
        answerBubble.textContent =
          locale === 'en'
            ? `Error: ${code}. Please try again.`
            : `出错了（${code}），请稍后重试。`;
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      answerBubble.textContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content ?? '';
            answer += token;
            answerBubble.textContent = answer;
            answerBubble.scrollIntoView({ block: 'end', behavior: 'smooth' });
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch {
      answerBubble.textContent =
        locale === 'en' ? 'Network error. Please try again.' : '网络错误，请稍后重试。';
    } finally {
      setLoading(false);
      input.focus();
    }
  });

  if (window.__askAiPendingOpen) {
    delete window.__askAiPendingOpen;
    openPanel();
  }
})();
