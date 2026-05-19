$(document).ready(function () {
  return getPaginationTabParams('pagination-init-draft');
});

$(document).on('click', '#tab_gars-draft', function () {
  return getPaginationTabParams('pagination-init-draft');
});

$(document).on('click', '#tab_gars-submitted', function () {
  return getPaginationTabParams('pagination-init-submitted');
});

$(document).on('click', '#tab_gars-cancelled', function () {
  return getPaginationTabParams('pagination-init-cancelled');
});

$(document).on('click', '.pagination__previous_button', function () {
  const dataconfig = getPaginationParams();
  goToPreviousPage(dataconfig.name);
});

$(document).on('click', '.pagination__first_number', function () {
  const dataconfig = getPaginationParams();
  goToPage(dataconfig.name, 1);
});

$(document).on('click', '.pagination__previous_number', function () {
  const dataconfig = getPaginationParams();
  goToPreviousPage(dataconfig.name);
});

$(document).on('click', '.pagination__next_number', function () {
  const dataconfig = getPaginationParams();
  goToNextPage(dataconfig.name);
});

$(document).on('click', '.pagination__last_number', function () {
  const dataconfig = getPaginationParams();
  goToPage(dataconfig.name, dataconfig.maxPage);
});

$(document).on('click', '.pagination__next_button', function () {
  const dataconfig = getPaginationParams();
  goToNextPage(dataconfig.name, 1);
});

function getPaginationParams() {
  const hashVal = window.location.hash ? window.location.hash : '#gars-draft';
  const name = hashVal.split('-').pop();
  const initPageParams = document.getElementById(`pagination-init-${name}`);
  return JSON.parse(initPageParams.dataset.config);
}

function getPaginationTabParams(tab) {
  const initPageParams = document.getElementById(tab);
  const dataconfig = JSON.parse(initPageParams.dataset.config);
  initialisePagination(dataconfig.name, dataconfig.totalItems, dataconfig.maxPage, dataconfig.pageSize);
  goToPage(dataconfig.name, 1);
}
