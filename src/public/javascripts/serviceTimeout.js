/**
 * Manages the session timeout warning popup and user inactivity.
 */
class SessionTimeoutManager {
  constructor() {
    this.STORAGE_KEY = 'sessionTimeoutWarningDisplayTime';
    this.inertSelectors = [
      '#main-content',
      '.govuk-header__container',
      '.govuk-footer',
      '.govuk-skip-link',
      '.govuk-phase-banner',
      '.govuk-back-link',
    ];

    // Cache DOM Elements
    this.serviceTimeoutEl = document.querySelector('#serviceTimeout');
    this.userLoggedInEl = document.querySelector('#user-logged-in');
    this.staySignedInBtn = document.querySelector('#stay-signed-in');
    this.countdownEl = document.getElementById('countDownServiceTimeout');

    // State variables
    this.initialInterval = null;
    this.logoutTimer = null;
    this.lastFocusedElement = null;
    this.sessionExpiryTimeLeft = 0;
    this.boundHandleKeyActions = this.handleKeyActions.bind(this);

    this.init();
  }

  async init() {
    if (!this.userLoggedInEl) {
      localStorage.removeItem(this.STORAGE_KEY);
      return;
    }

    if (this.serviceTimeoutEl) {
      this.serviceTimeoutEl.style.display = 'none';
    }

    await this.initializeDisplayTime();
    this.bindEvents();
    this.checkServiceTimeOut();
  }

  async initializeDisplayTime() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      try {
        const response = await fetch('/servicetimeout/inactivetime');
        const time = await response.json();
        localStorage.setItem(this.STORAGE_KEY, time);
      } catch (error) {
        this.logErrorOnServer(error);
      }
    }
    this.displayThreshold = Number(localStorage.getItem(this.STORAGE_KEY));
  }

  async checkServiceTimeOut() {
    this.setElementDisplay(this.serviceTimeoutEl, 'none');
    this.sessionExpiryTimeLeft = await this.getSessionTime();

    this.initialInterval = setInterval(() => {
      this.sessionExpiryTimeLeft--;
      if (this.sessionExpiryTimeLeft <= this.displayThreshold) {
        this.lastFocusedElement = document.activeElement;
        this.showTimeoutPopup(this.sessionExpiryTimeLeft);
      }
    }, 1000);
  }

  async extendLoginSession() {
    try {
      await fetch('/servicetimeout/refreshsession');
      document.documentElement.classList.remove('serviceTimeout');
      document.removeEventListener('keyup', this.handleKeyActions);

      this.setInertState(false);

      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
      }
      this.stopTimer();
      this.checkServiceTimeOut();
    } catch (error) {
      this.logErrorOnServer(error);
    }
  }

  async getSessionTime() {
    try {
      const response = await fetch('/servicetimeout/sessiontime');
      return await response.json();
    } catch (error) {
      this.logErrorOnServer(error);
      return 0;
    }
  }

  showTimeoutPopup(timeLeft) {
    this.stopTimer();
    this.setInertState(true);

    document.documentElement.classList.add('serviceTimeout');
    this.setElementDisplay(this.serviceTimeoutEl, 'flex');

    this.setLogoutTimerCountdown(timeLeft);

    if (this.staySignedInBtn) {
      this.staySignedInBtn.focus();
    }

    // Bind context to event listener so 'this' works properly
    document.addEventListener('keyup', this.boundHandleKeyActions);
  }

  stopTimer() {
    if (this.initialInterval) {
      clearInterval(this.initialInterval);
      this.initialInterval = null;
    }
    if (this.logoutTimer) {
      clearInterval(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  setLogoutTimerCountdown(timeLeft) {
    if (this.logoutTimer) {
      clearInterval(this.logoutTimer);
    }

    this.logoutTimer = setInterval(() => {
      const minutes = Math.ceil(timeLeft / 60);

      if (this.countdownEl) {
        if (minutes === 1 && [60, 40, 20].includes(timeLeft)) {
          this.countdownEl.textContent = `${timeLeft} seconds`;
        } else {
          this.countdownEl.textContent = `${minutes} minutes`;
        }
      }

      timeLeft--;

      if (timeLeft <= 0) {
        this.stopTimer();
        localStorage.removeItem(this.STORAGE_KEY);
        window.location.href = `${window.location.origin}/servicetimeout/logout`;
      }
    }, 1000);
  }

  handleKeyActions(e) {
    const activeId = document.activeElement.id;
    if (e.key === 'Escape' || (activeId === 'stay-signed-in' && e.key === 'Enter')) {
      this.stopTimer();
      this.extendLoginSession();
    }

    if (activeId === 'logout' && e.key === 'Enter') {
      localStorage.removeItem(this.STORAGE_KEY);
      window.location.href = `${window.location.origin}/servicetimeout/logout`;
    }
  }

  setInertState(isInert) {
    this.inertSelectors.forEach((selector) => {
      const el = document.querySelector(selector);
      if (el) el.inert = isInert;
    });
  }

  setElementDisplay(element, displayValue) {
    if (element) {
      element.style.setProperty('display', displayValue, 'important');
    }
  }

  logErrorOnServer(error) {
    fetch('/servicetimeout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceTimeoutPageError: error.message }),
    }).catch(() => {});
  }

  bindEvents() {
    if (this.staySignedInBtn) {
      this.staySignedInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopTimer();
        this.extendLoginSession();
        document.body.style.overflow = 'auto';
        this.setElementDisplay(this.serviceTimeoutEl, 'none');
      });
    }

    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden && this.serviceTimeoutEl) {
        this.sessionExpiryTimeLeft = await this.getSessionTime();
        const computedStyle = window.getComputedStyle(this.serviceTimeoutEl);
        if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
          if (this.sessionExpiryTimeLeft <= 0) {
            window.location.href = `${window.location.origin}/servicetimeout/logout`;
          } else {
            this.setLogoutTimerCountdown(this.sessionExpiryTimeLeft);
          }
        }
      }
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new SessionTimeoutManager();
});
