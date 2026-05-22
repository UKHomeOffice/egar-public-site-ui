const tabs = document.querySelectorAll('.status_tab');

const tabArr = [{ '#gars-draft': 'Draft', '#gars-submitted': 'Submitted', '#gars-cancelled': 'Cancelled' }];

tabs.forEach((tab) => {
  tab.addEventListener('click', function (e) {
    const tabName = e.target.getAttribute('href');
    window.location.href = `/home?status=${tabArr[0][tabName]}${e.target.getAttribute('href')}`;
  });
});
