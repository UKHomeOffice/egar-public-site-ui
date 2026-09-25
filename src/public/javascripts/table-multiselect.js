// Select all checkbox change
$('.jsCheckboxAll').change(function () {
  const currentTableCheckboxes = $(this).parents('table').find('.jsCheckbox');

  // Change all ".jsCheckbox" checked status
  currentTableCheckboxes.prop('checked', $(this).prop('checked'));

  // Toggle checked class on other checkboxes
  if ($(this).prop('checked')) {
    currentTableCheckboxes.parents('tr').addClass('checked');
  } else {
    currentTableCheckboxes.parents('tr').removeClass('checked');
  }
});

//".jsCheckbox" change
$('.jsCheckbox').change(function () {
  const currentTable = $(this).parents('table');
  const currentTableCheckboxes = currentTable.find('.jsCheckbox');
  const currentTableSelectAll = currentTable.find('.jsCheckboxAll');

  $(this).parents('tr').toggleClass('checked');

  //uncheck "select all", if one of the listed checkbox item is unchecked
  if (false == $(this).prop('checked')) {
    //change "select all" checked status to false
    currentTableSelectAll.prop('checked', false);
  }

  //check "select all" if all checkbox items are checked
  if (currentTableCheckboxes.filter(':checked').length == currentTableCheckboxes.length) {
    currentTableSelectAll.prop('checked', true);
  }
});

//Select entire table row
$('.table-clickable tbody tr').click(function (e) {
  if ($(this).hasClass('unselectable-row')) return;
  if (e.target.type == 'checkbox') {
    // stop the bubbling to prevent firing the rows click event
    e.stopPropagation();
  } else {
    // Click the
    if ($(this).hasClass('checked')) {
      $(this).find('input').click();
      $(this).removeClass('checked');
    } else {
      $(this).find('input').click();
      $(this).addClass('checked');
    }
  }
});
