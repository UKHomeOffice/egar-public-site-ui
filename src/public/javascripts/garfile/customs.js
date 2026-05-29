function hide(intentionValue) {
  if (intentionValue === 'Yes') {
    document.getElementById('prohibitedGoods').style.display = 'block';
    document.getElementById('baggage').style.display = 'block';
    document.getElementById('continentalShelf').style.display = 'block';
  } else {
    document.getElementById('prohibitedGoods').style.display = 'none';
    document.getElementById('baggage').style.display = 'none';
    document.getElementById('continentalShelf').style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const customsDeclarationIntetionValues = document.querySelectorAll('input[name="intentionValue"]');
  hide(document.querySelector('input[name="intentionValue"]:checked')?.value);
  customsDeclarationIntetionValues.forEach((customsDeclarationIntetionValue) => {
    customsDeclarationIntetionValue.addEventListener('change', (e) => {
      hide(e.target.value);
    });
  });
});
