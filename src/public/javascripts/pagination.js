function transitionToPage(pageNumber, formName) {
  nextPage = document.createElement('input');
  nextPage.type = 'hidden';
  nextPage.name = 'nextPage';
  nextPage.value = pageNumber;
  document.getElementById(formName).appendChild(nextPage);
  document.getElementById(formName).submit();
  return false;
}
