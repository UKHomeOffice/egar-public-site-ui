/**
 *  This js code shows the service time out popup 5 minutes before login session expires
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!localStorage.getItem('sessionTimeoutWarningDisplayTime')) {
    try {
      const sessionTimeoutWarningDisplayTime = await fetch('/servicetimeout/inactivetime');
      console.log(sessionTimeoutWarningDisplayTime);
      const time = await sessionTimeoutWarningDisplayTime.json();
      localStorage.setItem('sessionTimeoutWarningDisplayTime', time);
    } catch (error) {
      logErrorsOnServer(error);
    }
  }
  const SESSION_TIMEOUT_DISPLAY_TIME = localStorage.getItem('sessionTimeoutWarningDisplayTime');

  let initialInterval = null;
  const serviceTimeoutId = document.querySelector('#serviceTimeout');
  const userLoggedIn = document.querySelector('#user-logged-in');
  const staySignedInVar = document.querySelector('#stay-signed-in');

  let sessionExpiryTimeLeft = 0;
  let logoutTimer = 0;
  let lastFocusedElement = null;

  if (serviceTimeoutId) {
    serviceTimeoutId.style.display = 'none';
  }

  if (userLoggedIn !== null) {
    checkServiceTimeOut();
  } else {
    localStorage.removeItem('sessionTimeoutWarningDisplayTime');
  }

  async function checkServiceTimeOut() {
    document.getElementById('serviceTimeout').style.setProperty('display', 'none', 'important');
    sessionExpiryTimeLeft = await getSessionTime();

    initialInterval = setInterval(() => {
      sessionExpiryTimeLeft--;
      if (sessionExpiryTimeLeft <= SESSION_TIMEOUT_DISPLAY_TIME) {
        lastFocusedElement = document.activeElement;
        showTimeoutPopup(sessionExpiryTimeLeft);
      }
    }, 1000);
  }

  if (staySignedInVar) {
    staySignedInVar.addEventListener('click', (e) => {
      e.preventDefault();
      clearInterval(logoutTimer);
      extendLoginSession();
      document.body.style.overflow = 'auto';
    });
  }
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      sessionExpiryTimeLeft = await getSessionTime();
      if (
        window.getComputedStyle(serviceTimeoutId).display !== 'none' &&
        window.getComputedStyle(serviceTimeoutId).visibility !== 'hidden'
      ) {
        if (sessionExpiryTimeLeft <= 0) {
          window.location.href = `${window.location.origin}/servicetimeout/logout`;
        } else {
          setLogoutTimerCountdown(sessionExpiryTimeLeft);
        }
      }
    }
  });

  async function extendLoginSession() {
    try {
      await fetch('/servicetimeout/refreshsession');
      document.documentElement.classList.remove('serviceTimeout');
      document.removeEventListener('keyup', getKeyActions);
      document.querySelector('#main-content').inert = false;
      document.querySelector('.rebranded-one-login-header__container').inert = false;
      document.querySelector('.govuk-footer').inert = false;
      document.querySelector('.govuk-skip-link').inert = false;
      document.querySelector('.govuk-phase-banner').inert = false;
      // eslint-disable-next-line no-unused-expressions
      document.querySelector('.govuk-back-link') ? (document.querySelector('.govuk-back-link').inert = false) : '';
      lastFocusedElement.focus();
      checkServiceTimeOut();
    } catch (error) {
      logErrorsOnServer(error);
    }
  }

  async function getSessionTime() {
    try {
      const sessionTimeCall = await fetch('/servicetimeout/sessiontime');
      const sessionTime = await sessionTimeCall.json();
      return sessionTime;
    } catch (error) {
      logErrorsOnServer(error);
    }
  }

  function showTimeoutPopup(sessionExpiryTimeLeft) {
    stopTimer();

    //Disable the elements outside the popup using inert.
    document.querySelector('#main-content').inert = true;
    document.querySelector('.rebranded-one-login-header__container').inert = true;
    document.querySelector('.govuk-footer').inert = true;
    document.querySelector('.govuk-skip-link').inert = true;
    document.querySelector('.govuk-phase-banner').inert = true;
    // eslint-disable-next-line no-unused-expressions
    document.querySelector('.govuk-back-link') ? (document.querySelector('.govuk-back-link').inert = true) : '';

    document.documentElement.classList.add('serviceTimeout');
    document.getElementById('serviceTimeout').style.setProperty('display', 'flex', 'important');
    setLogoutTimerCountdown(sessionExpiryTimeLeft);
    staySignedInVar.focus();
    document.addEventListener('keyup', getKeyActions);
  }

  function stopTimer() {
    if (initialInterval !== null) {
      clearInterval(initialInterval);
      initialInterval = null;
    }
  }

  function setLogoutTimerCountdown(sessionExpiryTimeLeft) {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
    logoutTimer = setInterval(() => {
      const minutes = Math.ceil(sessionExpiryTimeLeft / 60);
      if (minutes === 1) {
        if (sessionExpiryTimeLeft === 60 || sessionExpiryTimeLeft === 40 || sessionExpiryTimeLeft === 20) {
          document.getElementById('countDownServiceTimeout').textContent = `${sessionExpiryTimeLeft} seconds`;
        }
      } else {
        document.getElementById('countDownServiceTimeout').textContent = `${minutes} minutes`;
      }
      sessionExpiryTimeLeft--;
      if (sessionExpiryTimeLeft <= 0) {
        clearInterval(initialInterval);
        localStorage.removeItem('sessionTimeoutWarningDisplayTime');
        window.location.href = `${window.location.origin}/servicetimeout/logout`;
      }
    }, 1000);
  }

  // 'esc' key use to extend session time and let user access the service
  function getKeyActions(e) {
    if (e.key === 'Escape' || (document.activeElement.id === 'stay-signed-in' && e.key === 'Enter')) {
      clearInterval(logoutTimer);
      extendLoginSession();
    }
    if (document.activeElement.id === 'logout' && e.key === 'Enter') {
      localStorage.removeItem('sessionTimeoutWarningDisplayTime');
      window.location.href = `${window.location.origin}/servicetimeout/logout`;
    }
  }
  function logErrorsOnServer(error) {
    fetch('/servicetimeout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serviceTimeoutPageError: error.message }),
    });
  }
});
