/**
 *  Prevent the duplicate submissions of the form and avoid multiple clicks on the 'Continue' button
 */

const formSubmit = document.querySelectorAll('.prevent-double-click');
let isFormSubmitted = false;

formSubmit.forEach(el => el.addEventListener('submit', (e) => {
  if (isFormSubmitted === true) {
    e.preventDefault();
  }
  isFormSubmitted = true;
}),);
