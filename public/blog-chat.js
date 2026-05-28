(function initBlogChat() {
  document.querySelectorAll('[data-bc-form]').forEach((element) => {
    if (!(element instanceof HTMLFormElement) || element.dataset.ready === 'true') return;

    const section = element.closest('.blog-chat');
    const configEl =
      section instanceof HTMLElement ? section.querySelector('[data-blog-chat-config]') : null;
    if (!(configEl instanceof HTMLScriptElement)) return;

    let locale = 'zh';
    let msgs = {};

    try {
      const config = JSON.parse(configEl.textContent || '{}');
      locale = config.locale ?? 'zh';
      msgs = config.msgs ?? {};
    } catch {
      return;
    }

    element.dataset.ready = 'true';

    const form = element;
    const chatBody = form.closest('.blog-chat-body');
    const submitBtn = form.querySelector('[data-bc-submit]');
    const clearBtn = form.querySelector('[data-bc-clear]');
    const resultEl = chatBody?.querySelector('[data-bc-result]');
    const sourcesEl = chatBody?.querySelector('[data-bc-sources]');
    const statusEl = chatBody?.querySelector('[data-bc-status]');
    const presetsEl = chatBody?.querySelector('[data-bc-presets]');

    if (!(submitBtn instanceof HTMLButtonElement) || !(clearBtn instanceof HTMLButtonElement)) {
      return;
    }

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
      statusEl.className = 'chat-status' + (isError ? ' is-error' : '');
      statusEl.hidden = !text;
    }

    function trackAiChat(status, props) {
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('ai_chat_usage', {
          surface: 'blog_chat',
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
      if (code === 'quota_exhausted') return msgs.quota;
      if (code === 'timeout') return msgs.timeout;
      return fallback;
    }

    function reset() {
      if (resultEl instanceof HTMLElement) {
        resultEl.textContent = '';
        resultEl.hidden = true;
        resultEl.classList.remove('is-streaming');
      }
      if (sourcesEl instanceof HTMLElement) {
        sourcesEl.innerHTML = '';
        sourcesEl.hidden = true;
      }
      clearBtn.hidden = true;
      setStatus('', false);
    }

    clearBtn.addEventListener('click', () => {
      reset();
      form.reset();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus('', false);

      const textarea = form.querySelector('textarea[name="question"]');
      if (!(textarea instanceof HTMLTextAreaElement) || !textarea.value.trim()) {
        setStatus(msgs.invalid, true);
        return;
      }

      const question = textarea.value.trim();
      trackAiChat('submit', { question_length: question.length });

      if (resultEl instanceof HTMLElement) {
        resultEl.textContent = '';
        resultEl.hidden = false;
        resultEl.classList.add('is-streaming');
      }
      if (sourcesEl instanceof HTMLElement) {
        sourcesEl.innerHTML = '';
        sourcesEl.hidden = true;
      }
      clearBtn.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = msgs.submitting;
      form.reset();

      try {
        const response = await fetch('/api/blog-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, locale }),
        });

        if (response.status === 429) {
          setStatus(msgs.rateLimit, true);
          trackAiChat('rate_limited', { http_status: response.status });
          if (resultEl instanceof HTMLElement) resultEl.hidden = true;
          return;
        }
        if (response.status === 503) {
          setStatus(msgs.notReady, true);
          trackAiChat('error', { http_status: response.status, error: 'not_ready' });
          if (resultEl instanceof HTMLElement) resultEl.hidden = true;
          return;
        }
        if (!response.ok || !response.body) {
          const code = await readErrorCode(response);
          setStatus(messageForError(code, msgs.generic), true);
          trackAiChat('error', { http_status: response.status, error: code || 'upstream' });
          if (resultEl instanceof HTMLElement) resultEl.hidden = true;
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let full = '';
        const MARKER = '__SOURCES__';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          if (resultEl instanceof HTMLElement) {
            const markerIndex = full.indexOf(MARKER);
            resultEl.textContent = markerIndex >= 0 ? full.slice(0, markerIndex).trim() : full;
          }
        }
        const tail = decoder.decode();
        if (tail) full += tail;

        const markerIndex = full.indexOf(MARKER);
        const answerText = (markerIndex >= 0 ? full.slice(0, markerIndex) : full).trim();
        const sourcesRaw = markerIndex >= 0 ? full.slice(markerIndex + MARKER.length) : '';

        if (resultEl instanceof HTMLElement) {
          resultEl.textContent = answerText;
          resultEl.classList.remove('is-streaming');
        }

        if (sourcesRaw && sourcesEl instanceof HTMLElement) {
          try {
            const sources = JSON.parse(sourcesRaw);
            if (Array.isArray(sources) && sources.length > 0) {
              const label = document.createElement('p');
              label.className = 'chat-sources-label';
              label.textContent = msgs.sources;
              const list = document.createElement('ul');
              list.className = 'chat-sources-list';
              for (const source of sources) {
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.href = source.url;
                link.textContent = source.title;
                link.className = 'chat-source-link';
                item.appendChild(link);
                list.appendChild(item);
              }
              sourcesEl.appendChild(label);
              sourcesEl.appendChild(list);
              sourcesEl.hidden = false;
            }
          } catch {
            // ignore malformed sources payload
          }
        }

        clearBtn.hidden = false;
        trackAiChat('success', {
          answer_length: answerText.length,
          source_count:
            sourcesEl instanceof HTMLElement ? sourcesEl.querySelectorAll('a').length : 0,
        });
      } catch {
        setStatus(msgs.generic, true);
        trackAiChat('error', { error: 'network' });
        if (resultEl instanceof HTMLElement) resultEl.hidden = true;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = msgs.submit;
      }
    });
  });
})();
