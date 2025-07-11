function loadAnalytics(){
  window.dataLayer = window.dataLayer || [];
  checkForCookie = getCookie('sgar_cookies_policy');

  if (checkForCookie == 'true') {
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '{{ g4_id }}', { 'anonymize_ip': true });
  }
  else{
    window['ga-disable-UA-{{ g4_id }}'] = true;
  }
}
loadAnalytics();