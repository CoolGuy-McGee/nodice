document.addEventListener("DOMContentLoaded", () => {
  // Basic wiring: send player count to game.html via query param.
  const startBtn = document.getElementById('start-game');
  const optionsBtn = document.getElementById('options-btn');
  const closeOptions = document.getElementById('close-options');
  const modal = document.getElementById('options-modal');
  const modalBackdrop = modal ? modal.querySelector('.modal-backdrop') : null;
  const playerInput = document.getElementById('player-count');

  if (startBtn && playerInput) {
    startBtn.addEventListener('click', () => {
      let n = parseInt(playerInput.value, 10);
      if (!Number.isFinite(n) || n < 1) n = 1;
      if (n > 16) n = 16;
      // navigate to the game page with players as a query param
      window.location.href = `game.html?players=${n}`;
    });
  }

  // Open modal: save last focused element and move focus into modal
  let lastFocused = null;
  if (optionsBtn && modal && closeOptions) {
    optionsBtn.addEventListener('click', () => {
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('modal-open'); // CSS can use this to prevent scroll
      // focus the close button
      closeOptions.focus();
    });
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (closeOptions) closeOptions.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Basic focus-trap and Escape handling while modal is open
  if (modal) {
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    });
  }

  // allow Enter to start
  const form = document.getElementById('menu-form');
  if (form && startBtn) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      startBtn.click();
    });
  }
});