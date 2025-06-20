var paginationState = {};
function initialisePagination(paginationName, totalResults, maxPages, pageSize){

    var elements = {};

    elements.previousButton = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__previous_button');
    elements.nextButton = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__next_button');
    elements.firstNumber = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__first_number');
    elements.firstEllipses = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__first_ellipses');
    elements.lastNumber = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__last_number');
    elements.lastEllipses = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__last_ellipses');
    elements.previousNumber = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__previous_number');
    elements.previousNumberLink = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__previous_number .pagination__link');
    elements.currentNumber = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__current_number');
    elements.currentNumberLink = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__current_number .pagination__link');
    elements.nextNumber = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__next_number');
    elements.nextNumberLink = document.querySelector('.pagination__' + paginationName + '_paginator .pagination__next_number .pagination__link');
    elements.fromNumber = document.querySelector('.pagination__' + paginationName + '_paginator #pagination__from_number');
    elements.toNumber = document.querySelector('.pagination__' + paginationName + '_paginator #pagination__to_number');

    this.paginationState[paginationName] = {
        currentPage: 1,
        totalResults: totalResults,
        maxPages: maxPages,
        pageSize: pageSize,
        elements: elements
    }

    if(maxPages<=1){
        hideElement(document.querySelector('.pagination__' + paginationName + '_paginator'));
    }
}

function goToPage(paginationName, page){

    var paginationData = this.paginationState[paginationName];

    if(page > 0){
        paginationData.currentPage = page;
    }

    //Hide all the results, then display the current page of results
    document.querySelectorAll('.pagination__table_'+paginationName+' .pagination-page').forEach(el=>hideElement(el));
    document.querySelectorAll('.pagination__table_'+paginationName+' .pagination-page.pagination-page_'+paginationData.currentPage).forEach(el=>showElement(el));

    //Hide and show all the paginator buttons
    if(paginationData.currentPage===1){
        hideElement(paginationData.elements.previousButton);
        hideElement(paginationData.elements.firstNumber);
    }else{
        showElement(paginationData.elements.previousButton);
        showElement(paginationData.elements.firstNumber);
    }

    if(paginationData.currentPage<=2){
        hideElement(paginationData.elements.previousNumber);
    }else{
        showElement(paginationData.elements.previousNumber);
    }

    if(paginationData.currentPage>3){
        showElement(paginationData.elements.firstEllipses);
    }else{
        hideElement(paginationData.elements.firstEllipses);
    }

    if(paginationData.currentPage>paginationData.maxPages-3){
        hideElement(paginationData.elements.lastEllipses);
    }else{
        showElement(paginationData.elements.lastEllipses);
    }

    if(paginationData.currentPage>paginationData.maxPages-2){
        hideElement(paginationData.elements.lastNumber);
    }else{
        showElement(paginationData.elements.lastNumber);
    }

    if(paginationData.currentPage>paginationData.maxPages-1){
        hideElement(paginationData.elements.nextNumber);
    }else{
        showElement(paginationData.elements.nextNumber);
    }

    if(paginationData.currentPage===paginationData.maxPages){
        hideElement(paginationData.elements.nextButton);
    }else{
        showElement(paginationData.elements.nextButton);
    }

    //Update the text on the paginator buttons
    paginationData.elements.previousNumberLink.textContent = paginationData.currentPage-1;
    paginationData.elements.previousNumberLink.ariaLabel = "Page " + paginationData.currentPage-1;
    paginationData.elements.currentNumberLink.textContent = paginationData.currentPage;
    paginationData.elements.currentNumberLink.ariaLabel = "Page " + paginationData.currentPage + ", current page";
    paginationData.elements.nextNumberLink.textContent = paginationData.currentPage+1;
    paginationData.elements.nextNumberLink.ariaLabel = "Page " + paginationData.currentPage+1;

    //Update the "Showing" text
    paginationData.elements.fromNumber.textContent = ((paginationData.currentPage-1)*paginationData.pageSize)+1;
    paginationData.elements.toNumber.textContent = Math.min(paginationData.totalResults, paginationData.currentPage*paginationData.pageSize);

}

function goToNextPage(paginationName){
    goToPage(paginationName, this.paginationState[paginationName].currentPage + 1);
}
function goToPreviousPage(paginationName){
    goToPage(paginationName, this.paginationState[paginationName].currentPage - 1);
}


//TODO see if there is a better way to hide and show elements
function hideElement(element){
    element.setAttribute("hidden", true);
    element.style.display="none";
}

function showElement(element){
    element.removeAttribute("hidden");
    element.style.display="";
}