function hide() {
  const yesRadio = document.querySelector('[name="intentionValue"][value="Yes"]');
  if (yesRadio && yesRadio.checked) {
    document.getElementById('prohibitedGoods').style.display = 'block';
    document.getElementById('baggage').style.display = 'block';
    document.getElementById('continentalShelf').style.display = 'block';
  } else {
    document.getElementById('prohibitedGoods').style.display = 'none';
    document.getElementById('baggage').style.display = 'none';
    document.getElementById('continentalShelf').style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', hide);
