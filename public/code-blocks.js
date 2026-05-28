(function () {
  'use strict';

  const COLLAPSE_HEIGHT = 352;

  function initCodeBlocks() {
    document.querySelectorAll('pre.astro-code:not([data-enhanced])').forEach(function (pre) {
      pre.setAttribute('data-enhanced', '');

      var lang = pre.getAttribute('data-language') || '';

      var toolbar = document.createElement('div');
      toolbar.className = 'code-block-toolbar';

      if (lang) {
        var badge = document.createElement('span');
        badge.className = 'code-block-lang';
        badge.textContent = lang;
        toolbar.appendChild(badge);
      }

      var copyBtn = document.createElement('button');
      copyBtn.className = 'code-block-copy';
      copyBtn.type = 'button';
      copyBtn.setAttribute('aria-label', 'Copy code');
      copyBtn.textContent = 'Copy';
      toolbar.appendChild(copyBtn);

      var wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(toolbar);
      wrapper.appendChild(pre);

      copyBtn.addEventListener('click', function () {
        var text = pre.innerText;
        if (!navigator.clipboard) {
          fallbackCopy(text);
          showCopied(copyBtn);
          return;
        }
        navigator.clipboard.writeText(text).then(
          function () { showCopied(copyBtn); },
          function () { fallbackCopy(text); showCopied(copyBtn); }
        );
      });

      if (pre.scrollHeight > COLLAPSE_HEIGHT) {
        wrapper.classList.add('is-collapsible');

        var expandBtn = document.createElement('button');
        expandBtn.className = 'code-expand-btn';
        expandBtn.textContent = '展开全部 ▾';
        wrapper.appendChild(expandBtn);

        expandBtn.addEventListener('click', function () {
          var expanded = wrapper.classList.toggle('is-expanded');
          expandBtn.textContent = expanded ? '收起 ▴' : '展开全部 ▾';
        });
      }
    });
  }

  function showCopied(btn) {
    btn.textContent = '✓ Copied';
    btn.classList.add('is-copied');
    setTimeout(function () {
      btn.textContent = 'Copy';
      btn.classList.remove('is-copied');
    }, 2000);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeBlocks);
  } else {
    initCodeBlocks();
  }

  document.addEventListener('astro:page-load', initCodeBlocks);
})();
