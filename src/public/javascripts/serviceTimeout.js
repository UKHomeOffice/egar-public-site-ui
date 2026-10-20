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
    this.isRefreshing = false;

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

  async checkServiceTimeOut(startingTimeLeft) {
    this.setElementDisplay(this.serviceTimeoutEl, 'none');
    this.sessionExpiryTimeLeft = startingTimeLeft ?? (await this.getSessionTime());

    this.stopTimer();
    this.initialInterval = setInterval(() => {
      this.sessionExpiryTimeLeft--;
      if (this.sessionExpiryTimeLeft <= this.displayThreshold) {
        this.showTimeoutPopup(this.sessionExpiryTimeLeft);
      }
    }, 1000);
  }

  async extendLoginSession() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;

    try {
      const response = await fetch('/servicetimeout/refreshsession');

      if (!response.ok) {
        throw new Error(`Session refreshed failed with status ${response.status}`);
      }

      const timeLeft = await response.json();
      this.stopTimer();
      this.hideTimeoutPopup();
      this.checkServiceTimeOut(timeLeft);
    } catch (error) {
      this.logErrorOnServer(error);
    } finally {
      this.isRefreshing = false;
    }
  }

  hideTimeoutPopup() {
    document.documentElement.classList.remove('serviceTimeout');
    document.removeEventListener('keyup', this.boundHandleKeyActions);
    document.body.style.overflowY = 'auto';
    this.setElementDisplay(this.serviceTimeoutEl, 'none');
    this.setInertState(false);

    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
  }

  async getSessionTime() {
    try {
      const response = await fetch('/servicetimeout/sessiontime');
      if (!response.ok) {
        throw new Error(`Session refreshed failed with status ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      this.logErrorOnServer(error);
      return 0;
    }
  }

  showTimeoutPopup(timeLeft) {
    this.stopTimer();

    if (!document.documentElement.classList.contains('serviceTimeout')) {
      this.lastFocusedElement = document.activeElement;
    }

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

  logout() {
    this.stopTimer();
    localStorage.removeItem(this.STORAGE_KEY);
    window.location.href = `${window.location.origin}/servicetimeout/logout`;
  }

  setLogoutTimerCountdown(timeLeft) {
    if (this.logoutTimer) {
      clearInterval(this.logoutTimer);
    }

    this.logoutTimer = setInterval(() => {
      timeLeft--;
      this.updateCountDownText(timeLeft);

      if (timeLeft <= 0) {
        this.logout();
      }
    }, 1000);
  }

  formatTimeLeft(timeLeft) {
    if (timeLeft > 60) {
      return `${Math.ceil(timeLeft / 60)} minutes`;
    }
    if (timeLeft > 40) {
      return '60 seconds';
    }

    if (timeLeft > 20) {
      return '40 seconds';
    }

    return '20 seconds';
  }

  updateCountDownText(timeLeft) {
    if (!this.countdownEl.textContent) return;

    const text = this.formatTimeLeft(timeLeft);
    if (this.countdownEl.textContent !== text) {
      this.countdownEl.textContent = text;
    }
  }

  handleKeyActions(e) {
    if (e.key === 'Escape') {
      this.extendLoginSession();
    }

    if (document.activeElement.id === 'logout' && e.key === 'Enter') {
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
        this.extendLoginSession();
      });
    }

    const logoutLink = document.querySelector('#logout');

    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem(this.STORAGE_KEY);
        window.location.href = `${window.location.origin}/user/logout`;
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
