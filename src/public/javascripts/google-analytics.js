const gaConfig = document.getElementById('gaconfig');
const gaId = gaConfig.dataset.gaId;

window.dataLayer = window.dataLayer || [];
const checkForCookie = getCookie('sgar_cookies_policy');
if (checkForCookie == 'true') {
  function gtag() {
    dataLayer.push(arguments);
  }

  gtag('js', new Date());
  gtag('config', gaId, { anonymize_ip: true });
} else {
  window[`ga-disable-UA-${gaId}`] = true;
}
