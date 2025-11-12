document.addEventListener('DOMContentLoaded', () => {
  // Select all forms with the "prevent-double-click" class
  const forms = document.querySelectorAll('form.prevent-double-click');

  forms.forEach((form) => {
    let isFormSubmitted = false; // Track if the form is already submitted

    // Attach an event listener to handle form submission
    form.addEventListener('submit', (e) => {
      // Check if the form has already been submitted
      if (isFormSubmitted) {
        e.preventDefault(); // Prevent the form from submitting again
      } else {
        isFormSubmitted = true; // Mark the form as submitted
      }
    });
  });
});
