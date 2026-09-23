$(function () {
  setupTableSearch('manifest-search', 'manifestTable_row');
  setupTableSearch('person-search', 'people_table_row');
  initPeopleSort();
  setupMultiSelectActions();
  setupDeletePeopleDialog();

  document.getElementById('exit').addEventListener('click', (event) => {
    sendAnalytics(event, 'GAR Manifest - Exit', 'click');
  });
  document.getElementById('continue').addEventListener('click', (event) => {
    sendAnalytics(event, 'GAR Manifest - Continue', 'click');
  });
});

function initPeopleSort() {
  $('#people_table th').each(function (col) {
    $(this).hover(
      function () {
        $(this).addClass('focus');
      },
      function () {
        $(this).removeClass('focus');
      }
    );
    $(this).click(function () {
      if ($(col.parent()).hasClass('unselectable-row')) return;
      if ($(this).is('.asc')) {
        $(this).removeClass('asc');
        $(this).addClass('desc selected');
        sortOrder = -1;
      } else {
        $(this).addClass('asc selected');
        $(this).removeClass('desc');
        sortOrder = 1;
      }
      $(this).siblings().removeClass('asc selected');

      $(this).siblings().removeClass('desc selected');

      var arrData = $('#people_table').find('tbody >tr:has(td)').get();

      arrData.sort(function (a, b) {
        var val1 = $(a).children('td').eq(col).text().toUpperCase();
        var val2 = $(b).children('td').eq(col).text().toUpperCase();

        if ($.isNumeric(val1) && $.isNumeric(val2)) {
          return sortOrder == 1 ? val1 - val2 : val2 - val1;
        } else {
          return val1 < val2 ? -sortOrder : val1 > val2 ? sortOrder : 0;
        }
      });
      $.each(arrData, function (index, row) {
        $('#people_table tbody').append(row);
      });
    });
  });
}

function setupTableSearch(inputId, rowsId) {
  $(`#${inputId}`).on('keyup', function () {
    var value = $(this).val().toLowerCase();
    $(`#${rowsId} tr`).filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
}

function setupMultiSelectActions() {
  document.querySelectorAll('table[data-multi-select-group]').forEach((table) => {
    const group = table.dataset.multiSelectGroup;
    const actionButtons = Array.from(document.querySelectorAll('.multi-submit-button')).filter(
      (button) => button.dataset.multiSelectGroup === group
    );
    const checkboxes = table.querySelectorAll('.jsCheckbox');

    const updateActions = () => {
      const hasSelection = Array.from(checkboxes).some((checkbox) => checkbox.checked);

      actionButtons.forEach((button) => {
        button.disabled = !hasSelection;
      });
    };

    table.addEventListener('change', (event) => {
      if (event.target.matches('.jsCheckboxAll')) {
        checkboxes.forEach((checkbox) => {
          checkbox.checked = event.target.checked;
        });
      }

      if (event.target.matches('.jsCheckboxAll, .jsCheckbox')) {
        updateActions();
      }
    });

    updateActions();
  });
}

function setupDeletePeopleDialog() {
  const deletePeopleDialog = document.getElementById('deletePeopleDialog');
  const deletePeopleDialogButton = document.getElementById('delete-people-dialog-button');
  const closeDialogButton = document.getElementById('closeDialogButton');
  const manifestTable = document.getElementById('manifest_table');
  const peopleToDeleteList = document.getElementById('peopleToDeleteList');

  dialogPolyfill.registerDialog(deletePeopleDialog);

  closeDialogButton.addEventListener('click', () => {
    deletePeopleDialog.close();
  });

  deletePeopleDialogButton.addEventListener('click', () => {
    const manifestTableRows = Array.from(manifestTable.querySelectorAll('.jsCheckbox:checked')).map((checkbox) =>
      checkbox.closest('tr')
    );

    peopleToDeleteList.replaceChildren(
      ...manifestTableRows.map((tableRow) => {
        const garPersonLastName = tableRow.querySelector('.garPersonLastName');
        const garPersonFirstName = tableRow.querySelector('.garPersonFirstName');
        const garPersonNationality = tableRow.querySelector('.garPersonNationality');

        const garPersonToDelete = document.createElement('li');

        garPersonToDelete.textContent = `${garPersonLastName.textContent}, ${garPersonFirstName.textContent}, ${garPersonNationality.textContent}`;
        return garPersonToDelete;
      })
    );

    deletePeopleDialog.showModal();
  });
}
