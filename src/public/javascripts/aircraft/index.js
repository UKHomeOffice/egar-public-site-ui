$(document).ready(function () {
  $('#aircraft-search').on('keyup', function () {
    var value = $(this).val().toLowerCase();
    $('#aircraft_table_row tr').filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});
