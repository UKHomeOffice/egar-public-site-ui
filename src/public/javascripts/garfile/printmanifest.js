document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("display-manifest").addEventListener("click", () => {
    document.title = document.getElementById("garID_title").textContent;
    window.print();
  })
});
