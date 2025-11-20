document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cookies_accept").addEventListener("click", accept_cookies);
  document.getElementById("cookies_reject").addEventListener("click", reject_cookies);
  document.getElementById("hide_accept_message").addEventListener("click", hide_message);
  document.getElementById("hide_reject_message").addEventListener("click", hide_message);
});
