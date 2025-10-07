document.addEventListener('DOMContentLoaded', () => {
  const pollingInterval = 2000;
  const loadingScreen = document.getElementById('checkin-loading-screen');
  const bodyElement = document.body;
  let pollIntervalId;

  const resubmit0T = document.getElementById("resubmit0T");
  const reSubmitGarForm = document.getElementById("reSubmitGarForm");
  const resubmitFor0TLink = document.getElementById("resubmitFor0TLink");
  const params = new URLSearchParams(window.location.search);

  async function pollAndUpdateDOM() {
    try {
      const checkinResponse = await fetch('/garfile/amg/checkin?poll');
      const {progress} = await checkinResponse.json();
      if (progress !== 'Incomplete') {
        location.reload();
        clearInterval(pollIntervalId);
      }
    } catch {
      bodyElement.innerHTML =
        '<p>Could not load data. Please try again later</p>';
    }
  }

 
  if (loadingScreen) {
    if(params.get('resubmitted') === 'yes'){
      loadingScreen.querySelector("h2").textContent = "Resubmitting checks for passengers with 'System time out' status.";
    }
    else{
      loadingScreen.querySelector("h2").textContent = "Loading UPT (Universal Permission to Travel) checks.";
    }
    pollIntervalId = setInterval(pollAndUpdateDOM, pollingInterval);
  }

  if(resubmit0T){
  resubmit0T.addEventListener("click", (e) => {
    e.preventDefault();
    resubmitFor0TLink.value = "true";
    reSubmitGarForm.submit();
   });
 }
});


