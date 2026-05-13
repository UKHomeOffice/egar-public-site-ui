$("input[value='Save and continue'][type='button']").click(function (eventObj) {
  $('<input />')
    .attr('type', 'hidden')
    .attr('name', 'buttonClicked')
    .attr('value', 'Save and continue')
    .appendTo('#page-form');
  return true;
});
$("input[value='Add to GAR'][type='button']").click(function (eventObj) {
  $('<input />')
    .attr('type', 'hidden')
    .attr('name', 'buttonClicked')
    .attr('value', 'Add to GAR')
    .appendTo('#page-form');
  return true;
});
