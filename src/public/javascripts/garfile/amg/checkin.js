document.addEventListener('DOMContentLoaded', () => {
  const pollingInterval = 2000;
  const loadingScreen = document.getElementById('checkin-loading-screen');
  const bodyElement = document.body;
  let pollIntervalId;

  async function pollAndUpdateDOM() {
    try {
      const checkinResponse = await fetch('/garfile/amg/checkin?poll');
      const { progress } = await checkinResponse.json();
      if (progress !== 'Incomplete') {
        location.reload();
        clearInterval(pollIntervalId);
      }
    } catch {
      bodyElement.innerHTML = '<p>Could not load data. Please try again later</p>';
    }
  }

  if (loadingScreen) {
    pollIntervalId = setInterval(pollAndUpdateDOM, pollingInterval);
  }
  const resubmitted = $('#resubmitted').val();

  window.myinterval = setInterval(function () {
    const permissionDetails = () => Array.from(document.getElementsByClassName('permission-details'));
    const permissionDetailsState = permissionDetails().map(el => el.open);

    $.get(`/garfile/amg/checkin?template=pane&resubmitted=${resubmitted}`, null, function (data) {
      const html = $(data);

      if (!html.find('#spinner').length) {
        clearInterval(window.myinterval);
      }

      $('#pane').html($(data));
      $('#banner0T-content').appendTo('#top-notification-banner');
      $('#banner0T').empty();

      permissionDetails().forEach((el, index) => {

        el.toggleAttribute("open", permissionDetailsState[index])
      })
    });

  }, 3000);
});

$(document).on('click', '#resubmit0T', function () {
  $('#resubmitFor0TLink').val('yes');
  $('#reSubmitGarForm').submit();
});
