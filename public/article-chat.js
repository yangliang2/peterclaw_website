(function initArticleChat() {
  document.querySelectorAll('[data-chat-form]').forEach((element) => {
    if (!(element instanceof HTMLFormElement) || element.dataset.ready === 'true') return;

    const details = element.closest('.article-chat');
    const payloadEl =
      details instanceof HTMLElement
        ? details.querySelector('[data-article-chat-payload]')
        : null;
    const configEl =
      details instanceof HTMLElement ? details.querySelector('[data-article-chat-config]') : null;

    if (!(payloadEl instanceof HTMLScriptElement) || !(configEl instanceof HTMLScriptElement)) {
      return;
    }

    let articleContent = '';
    let locale = 'zh';
    let messages = {};

    try {
      articleContent = JSON.parse(payloadEl.textContent || '""');
      const config = JSON.parse(configEl.textContent || '{}');
      locale = config.locale ?? 'zh';
      messages = config.messages ?? {};
    } catch {
      return;
    }

    element.dataset.ready = 'true';

    const form = element;
    const chatBody = form.closest('.article-chat-body');
    const submitBtn = form.querySelector('[data-chat-submit]');
    const clearBtn = form.querySelector('[data-chat-clear]');
    const historyEl = chatBody?.querySelector('[data-chat-history]');
    const statusEl = chatBody?.querySelector('[data-chat-status]');
    const presetsEl = chatBody?.querySelector('[data-chat-presets]');

    if (!(submitBtn instanceof HTMLButtonElement) || !(clearBtn instanceof HTMLButtonElement)) {
      return;
    }

    let history = [];

    if (presetsEl) {
      presetsEl.querySelectorAll('.chat-preset-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const textarea = form.querySelector('textarea[name="question"]');
          if (textarea instanceof HTMLTextAreaElement) {
            textarea.value = (btn.textContent || '').trim();
            textarea.focus();
          }
        });
      });
    }

    function setStatus(text, isError) {
      if (!(statusEl instanceof HTMLElement)) return;
      statusEl.textContent = text;
      statusEl.className = 'article-chat-status' + (isError ? ' is-error' : '');
      statusEl.hidden = !text;
    }

    function trackAiChat(status, props) {
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('ai_chat_usage', {
          surface: 'article_chat',
          locale,
          status,
          ...props,
        });
      }
    }

    async function readErrorCode(response) {
      try {
        const payload = await response.clone().json();
        return typeof payload.error === 'string' ? payload.error : '';
      } catch {
        return '';
      }
    }

    function messageForError(code, fallback) {
      if (code === 'quota_exhausted') return messages.quota;
      if (code === 'timeout') return messages.timeout;
      return fallback;
    }

    function createMessageEl(role, text) {
      const div = document.createElement('div');
      div.className = 'chat-message chat-message--' + role;
      const label = document.createElement('span');
      label.className = 'chat-message-label';
      label.textContent = role === 'user' ? messages.you : messages.ai;
      const contentDiv = document.createElement('div');
      contentDiv.className = 'chat-message-content';
      if (text) contentDiv.textContent = text;
      div.appendChild(label);
      div.appendChild(contentDiv);
      return div;
    }

    clearBtn.addEventListener('click', () => {
      history = [];
      if (historyEl instanceof HTMLElement) {
        historyEl.innerHTML = '';
        historyEl.hidden = true;
      }
      clearBtn.hidden = true;
      setStatus('', false);
      form.reset();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus('', false);

      const textarea = form.querySelector('textarea[name="question"]');
      if (!(textarea instanceof HTMLTextAreaElement) || !textarea.value.trim()) {
        setStatus(messages.invalid, true);
        return;
      }

      const question = textarea.value.trim();
      trackAiChat('submit', { question_length: question.length });

      const apiMessages = [...history, { role: 'user', content: question }].slice(-6);

      const pairEl = document.createElement('div');
      pairEl.className = 'chat-pair';
      const userMsgEl = createMessageEl('user', question);
      const aiMsgEl = createMessageEl('ai', '');
      aiMsgEl.classList.add('is-streaming');
      const aiContentEl = aiMsgEl.querySelector('.chat-message-content');
      pairEl.appendChild(userMsgEl);
      pairEl.appendChild(aiMsgEl);

      if (historyEl instanceof HTMLElement) {
        historyEl.appendChild(pairEl);
        historyEl.hidden = false;
        setTimeout(() => pairEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      }

      form.reset();
      submitBtn.disabled = true;
      submitBtn.textContent = messages.submitting;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, articleContent, locale }),
        });

        if (response.status === 429) {
          setStatus(messages.rateLimit, true);
          trackAiChat('rate_limited', { http_status: response.status });
          pairEl.remove();
          if (historyEl instanceof HTMLElement && historyEl.children.length === 0) {
            historyEl.hidden = true;
          }
          return;
        }
        if (!response.ok || !response.body) {
          const code = await readErrorCode(response);
          setStatus(messageForError(code, messages.generic), true);
          trackAiChat('error', { http_status: response.status, error: code || 'upstream' });
          pairEl.remove();
          if (historyEl instanceof HTMLElement && historyEl.children.length === 0) {
            historyEl.hidden = true;
          }
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullAnswer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullAnswer += chunk;
          if (aiContentEl instanceof HTMLElement) aiContentEl.textContent = fullAnswer;
        }
        const remainder = decoder.decode();
        if (remainder) {
          fullAnswer += remainder;
          if (aiContentEl instanceof HTMLElement) aiContentEl.textContent = fullAnswer;
        }

        aiMsgEl.classList.remove('is-streaming');

        history.push({ role: 'user', content: question });
        history.push({ role: 'assistant', content: fullAnswer });

        clearBtn.hidden = false;
        trackAiChat('success', { answer_length: fullAnswer.length });
      } catch {
        setStatus(messages.generic, true);
        trackAiChat('error', { error: 'network' });
        pairEl.remove();
        if (historyEl instanceof HTMLElement && historyEl.children.length === 0) {
          historyEl.hidden = true;
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = messages.submitLabel;
      }
    });
  });
})();
