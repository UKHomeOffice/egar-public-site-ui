document.addEventListener('DOMContentLoaded', () => {
  const pollingInterval = 2000;
  const loadingScreen = document.getElementById('checkin-loading-screen');
  const bodyElement = document.body;
  let pollIntervalId;

  const resubmitZeroT = document.getElementById("resubmitZeroT");
  const reSubmitGarForm = document.getElementById("reSubmitGarForm");
  

  async function pollAndUpdateDOM() {
    try {
      const checkinResponse = await fetch('/garfile/amg/checkin?poll');
      const progress = await checkinResponse.json();
      if (progress.progress !== 'Incomplete') {
        location.reload();
        clearInterval(pollIntervalId);
      }
    } catch {
      bodyElement.innerHTML =
        '<p>Could not load data. Please try again later</p>';
    }
  }

  if (loadingScreen) {
    pollIntervalId = setInterval(pollAndUpdateDOM, pollingInterval);
  }

  if(resubmitZeroT){
  resubmitZeroT.addEventListener("click", (e) => {
    e.preventDefault();

    reSubmitGarForm.submit();

    });
 }
});


