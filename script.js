    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');
    const keys = document.querySelector('.keys');
    const themeToggle = document.querySelector('[data-theme-toggle]');
    const root = document.documentElement;

    let expression = '';
    let justCalculated = false;
    let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    updateThemeIcon();

    function updateThemeIcon() {
      themeToggle.innerHTML = theme === 'dark'
        ? '<span class="sr-only">Toggle theme</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>'
        : '<span class="sr-only">Toggle theme</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
      themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }

    function sanitizeExpression(input) {
      return input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    }

    function formatForScreen(input) {
      return input
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/-/g, '−');
    }

    function safeEvaluate(input) {
      const sanitized = sanitizeExpression(input);
      if (!/^[0-9+\-*/%.()\s]+$/.test(sanitized)) throw new Error('Invalid');
      const value = Function(`"use strict"; return (${sanitized})`)();
      if (!Number.isFinite(value)) throw new Error('Math');
      return Number(value.toFixed(10)).toString();
    }

    function render() {
      expressionEl.textContent = expression ? formatForScreen(expression) : '0';
      if (!expression) {
        resultEl.textContent = '0';
        return;
      }
      try {
        resultEl.textContent = safeEvaluate(expression);
      } catch {
        resultEl.textContent = '—';
      }
    }

    function appendValue(value) {
      if (justCalculated && /[0-9.]/.test(value)) expression = '';
      justCalculated = false;
      const lastChar = expression.slice(-1);
      const operators = ['+', '-', '*', '/', '%'];

      if (operators.includes(value)) {
        if (!expression && value !== '-') return;
        if (operators.includes(lastChar)) {
          expression = expression.slice(0, -1) + value;
          render();
          return;
        }
      }

      if (value === '.') {
        const currentNumber = expression.split(/[+\-*/%]/).pop();
        if (currentNumber.includes('.')) return;
        if (!currentNumber) value = '0.';
      }

      expression += value;
      render();
    }

    function clearAll() {
      expression = '';
      justCalculated = false;
      render();
    }

    function deleteLast() {
      expression = expression.slice(0, -1);
      justCalculated = false;
      render();
    }

    function calculate() {
      if (!expression) return;
      try {
        expression = safeEvaluate(expression);
        justCalculated = true;
        render();
      } catch {
        resultEl.textContent = 'Error';
        justCalculated = true;
      }
    }

    keys.addEventListener('click', (event) => {
      const key = event.target.closest('button');
      if (!key) return;
      const { value, action } = key.dataset;
      if (value) appendValue(value);
      if (action === 'clear') clearAll();
      if (action === 'delete') deleteLast();
      if (action === 'calculate') calculate();
    });

    document.addEventListener('keydown', (event) => {
      const allowed = '0123456789+-*/%.()';
      if (allowed.includes(event.key)) {
        event.preventDefault();
        appendValue(event.key);
      }
      if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        calculate();
      }
      if (event.key === 'Backspace') {
        event.preventDefault();
        deleteLast();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        clearAll();
      }
    });

    themeToggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      updateThemeIcon();
    });

    render();