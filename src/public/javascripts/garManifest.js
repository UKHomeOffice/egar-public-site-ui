$(function () {
  initManifestSearch();
  initPeopleSearch();
  initPeopleSort();
  handleMultiSelectTableButtons();
  setupDeletePeopleDialog();
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

function initManifestSearch() {
  $('#manifest-search').on('keyup', function () {
    var value = $(this).val().toLowerCase();
    $('#manifestTable_row tr').filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
}

function initPeopleSearch() {
  $('#person-search').on('keyup', function () {
    var value = $(this).val().toLowerCase();
    $('#people_table_row tr').filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
}

function handleMultiSelectTableButtons() {
  $('.multi-submit-button').each((index, element) => {
    element.disabled = true;
  });
  const isAnyCheckboxesChecked = () => {
    const checkedBoxes = $('.jsCheckbox').filter((index, element) => {
      return element.checked;
    });

    return checkedBoxes.length > 0;
  };
  // Select all checkbox change
  $('.jsCheckboxAll').change(function () {
    const currentTableCheckboxButtons = $(this)
      .parents('form')
      .find('.multi-submit-button');

    currentTableCheckboxButtons.each(function (index, element) {
      element.disabled = !isAnyCheckboxesChecked();
    });
  });

  //".jsCheckbox" change
  $('.jsCheckbox').change(function () {
    const currentTableCheckboxButtons = $(this)
      .parents('form')
      .find('.multi-submit-button');

    currentTableCheckboxButtons.each(function (index, element) {
      element.disabled = !isAnyCheckboxesChecked();
    });
  });
}

function setupDeletePeopleDialog() {
  const deletePeopleDialog = document.getElementById('deletePeopleDialog');
  const deletePeopleDialogButton = document.getElementById(
    'delete-people-dialog-button'
  );
  const peopleToDeleteList = document.getElementById('peopleToDeleteList');

  dialogPolyfill.registerDialog(deletePeopleDialog);

  deletePeopleDialogButton.addEventListener('click', (e) => {
    const garPeopleLastNames = Array.from(
      document.getElementsByClassName('garPersonLastName')
    );
    const garPeopleFirstNames = Array.from(
      document.getElementsByClassName('garPersonFirstName')
    );
    const garPeopleNationalities = Array.from(
      document.getElementsByClassName('garPersonNationality')
    );

    const manifestTableRows = Array.from(
      document.querySelectorAll(
        '#manifestTable_row > .govuk-table__row:has(.jsCheckbox:checked)'
      )
    );

    Array.from(peopleToDeleteList.children).forEach((element) => {
      peopleToDeleteList.removeChild(element);
    });

    const listOfPeopleToDelete = manifestTableRows.map((tableRow) => {
      const [garPersonLastName] = garPeopleLastNames.filter((element) =>
        tableRow.contains(element)
      );
      const [garPersonFirstName] = garPeopleFirstNames.filter((element) =>
        tableRow.contains(element)
      );
      const [garPersonNationality] = garPeopleNationalities.filter((element) =>
        tableRow.contains(element)
      );

      const garPersonToDelete = document.createElement('li');

      garPersonToDelete.textContent = `${garPersonLastName.textContent}, ${garPersonFirstName.textContent}, ${garPersonNationality.textContent}`;
      return garPersonToDelete;
    });

    listOfPeopleToDelete.forEach((personToDelete) => {
      peopleToDeleteList.appendChild(personToDelete);
    });

    deletePeopleDialog.showModal();
  });
}
