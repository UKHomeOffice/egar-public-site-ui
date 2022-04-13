function setCookie(name, value, expiryDays) {
  const currDate = new Date();
  currDate.setTime(currDate.getTime() + (expiryDays*24*60*60*1000));
  const expires = "expires="+ currDate.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

var CONSENT_COOKIE_NAME = 'sgar_cookies_policy';
var DEFAULT_COOKIE_CONSENT = 'false';


function hasSeenCookie(cookieName) {
  return document.cookie.includes(cookieName);
};

function showCookieBanner(){
  const banner = document.getElementsByClassName("govuk-cookie-banner")[0];
  banner.style.display = "block";

};

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function deleteCookie (name) {
    console.log(window.location.hostname);
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=' + window.location.hostname + ';path=/';
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=.' + window.location.hostname + ';path=/';
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=.' + location.host.replace('www.','') + ';path=/';
}

function Cookie (name, value) {
  if (typeof value !== 'undefined') {
    if (value === false || value === null) {
      deleteCookie(name);
    }
  else {
    return getCookie(name)
      }
  }
}

//if (!hasSeenCookie('seen_cookie_message')) {
// showCookieBanner();
//  setCookie('seen_cookie_message', 'yes', 30);
//};

if (getCookie('sgar_cookies_policy') === '' || getCookie('sgar_cookies_policy') === null){
  showCookieBanner();
}

function accept_cookies(){
  document.getElementById("cookies_accept_message").style.display = "block";
  document.getElementById("main_cookie_message").style.display = "none";
  setCookie('sgar_cookies_policy', true, 30);
}

function reject_cookies(){
  document.getElementById("cookies_reject_message").style.display = "block";
  document.getElementById("main_cookie_message").style.display = "none";
  setCookie('sgar_cookies_policy', false, 30);
  deleteCookie('_ga');
  deleteCookie('_gid');
  deleteCookie('_gat_gtag_UA + {{ ga_id }}');
  deleteCookie('_gat');
}

function hide_message(){
  document.getElementById("main_cookie_banner").style.display = "none";
  location.reload();
}

function change_cookie_preference(){
  if (document.getElementById('radio_cookies_accept').checked == true){
    setCookie('sgar_cookies_policy', true, 30);
    document.getElementById("preference_changed").removeAttribute('hidden');
    document.getElementById("preference_changed").focus();
  }
  else if (document.getElementById('radio_cookies_reject').checked == true){
    setCookie('sgar_cookies_policy', false, 30);
    document.getElementById("preference_changed").removeAttribute('hidden');
    document.getElementById("preference_changed").focus();
    deleteCookie('_ga');
    deleteCookie('_gid');
    deleteCookie('_gat_gtag_UA + {{ ga_id }}');
    deleteCookie('_gat');
    console.log(window.location.hostname);

  }
  
  else{
    setCookie('sgar_cookies_policy', false, 30);
  }
}
