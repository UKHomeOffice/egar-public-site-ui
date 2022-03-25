function setCookie(name, value, expiryDays) {
  const currDate = new Date();
  currDate.setTime(currDate.getTime() + (expiryDays*24*60*60*1000));
  const expires = "expires="+ currDate.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

function hasSeenCookie(cookieName) {
  return document.cookie.includes(cookieName);
};

function showCookieBanner(){
  const banner = document.getElementsByClassName("app-cookie-banner")[0];
  banner.style.display = "block";
};

if (!hasSeenCookie('seen_cookie_message')) {
  showCookieBanner();
  setCookie('seen_cookie_message', 'yes', 30);
};