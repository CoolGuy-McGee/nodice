//NoDice Entrance by Kaden Hansen
//License: All Rights Reserved ©

//Paperback by Bensound.com
//License code: WDELTECG6IBXAHH1
//Artist: : Diffie Bosman


// Audio (back-to-back, 'paperback' loops). Provide your own files under /assets
const entrance = new Audio("assets/nodice_entrance.mp3");
const paperback = new Audio("assets/paperback.mp3");
paperback.loop = true;

const overlay = document.getElementById("start-overlay");
const beginBtn = document.getElementById("begin");
const logo = document.getElementById("logo");
const stage = document.getElementById("stage");

let started = false;
let entranceStarted = false;

/** Fade the logo over 18s */
function fadeInLogo() {
  logo.classList.remove("is-hidden", "instant");
  void logo.offsetWidth; // ensure transition
  logo.classList.add("fade-in");
}

/** Show the logo instantly (no fade) */
function showLogoInstant() {
  logo.classList.remove("is-hidden", "fade-in");
  logo.classList.add("instant");
}

/** Complete docking after fade completes */
logo.addEventListener("transitionend", (e) => {
  if (e.propertyName === "opacity") {
    document.body.classList.add("docked");
  }
}, { passive: true });

function hideOverlay() { overlay.classList.add("hidden"); }
function showOverlay() { overlay.classList.remove("hidden"); }

/** Hard skip to the menu: stop intro, show docked logo, start loop */
function skipToMenu() {
  // Stop entrance immediately if it was playing
  try {
    entrance.pause();
    // jump to end so 'ended' listeners won't fire later
    if (!isNaN(entrance.duration)) entrance.currentTime = entrance.duration;
  } catch {}

  // Reveal logo instantly and dock UI
  showLogoInstant();
  document.body.classList.add("docked");

  // Start the looping track
  paperback.play().catch(err => console.warn("paperback play failed:", err));

  // Hide the overlay
  hideOverlay();

  // Mark flow as started so we don’t double-handle input
  started = true;
  entranceStarted = false;
}

/** Normal flow: Play button -> fade + entrance -> paperback loop */
function startNormal() {
  if (started) return;
  started = true;

  fadeInLogo();

  entrance.play()
    .then(() => {
      entranceStarted = true;
      entrance.addEventListener("ended", () => {
        paperback.play().catch(err => console.warn("paperback play failed:", err));
      }, { once: true });
      hideOverlay();
    })
    .catch(err => {
      console.warn("Autoplay blocked; waiting for gesture:", err);
      started = false;
      showOverlay();
    });
}

/** Legacy skip entry point kept for compatibility */
function skipIntro() {
  // Always route to the robust skipper
  skipToMenu();
}

/* Overlay click handling:
   - Clicking the green button starts NORMAL flow.
   - Clicking anywhere else on the overlay SKIPS the intro (at any time). */
overlay.addEventListener("click", (e) => {
  const target = e.target;
  if (target && target.id === "begin") {
    startNormal();
  } else {
    skipToMenu();
  }
}, { capture: true });

/* Keyboard shortcuts:
   - Esc or 'S' to skip to menu at any time while overlay is visible. */
document.addEventListener("keydown", (e) => {
  if (overlay && !overlay.classList.contains("hidden")) {
    if (e.key === "Escape" || e.key.toLowerCase() === "s") {
      e.preventDefault();
      skipToMenu();
    }
  }
});

/* Accessibility: allow Enter/Space on the Play button to start normal flow */
beginBtn.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    startNormal();
  }
});

/* Pause/resume on tab hide/show (optional) */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    entrance.pause();
    paperback.pause();
  } else {
    // Resume whichever track is appropriate (no persisted state)
    if (started) {
      // If we were mid-intro and not ended, prefer entrance; otherwise paperback
      if (entranceStarted && !entrance.ended) {
        entrance.play().catch(() => {});
      } else {
        paperback.play().catch(() => {});
      }
    }
  }
});

/* Always show overlay on load (no persistence) */
window.addEventListener("DOMContentLoaded", () => {
  overlay.classList.remove("hidden");
});

/* Clean up on unload (optional) */
window.addEventListener("beforeunload", () => {
  entrance.pause();
  paperback.pause();
});