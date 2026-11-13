document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('change_cookie_preference').addEventListener('click', change_cookie_preference);
  document.getElementById('go-back-link').addEventListener('click', (event) => {
    sessionStorage.setItem('scrollTop', 'true');
    history.back();
  });
});
