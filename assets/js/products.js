document.addEventListener('DOMContentLoaded', () => {
  const pageId = document.body.id;
  
  // DOM Elements
  const pageTitleEl = document.getElementById('page-title');
  const searchInput = document.getElementById('search-input');
  const pageSizeSelect = document.getElementById('page-size');
  const tableBody = document.getElementById('product-table-body');
  const paginationWrapper = document.getElementById('pagination-wrapper');

  // State
  let currentPage = 1;
  let rowsPerPage = parseInt(pageSizeSelect.value); // Get initial value from select
  let sourceData = [];
  let pageConfig = {};
  let filteredData = [];

  // Determine which page we are on
  switch (pageId) {
    case 'page-tablets':
      pageConfig = { title: 'Tablets', data: productData.tablets };
      break;
    case 'page-capsules':
      pageConfig = { title: 'Capsules', data: productData.capsules };
      break;
    case 'page-syrups':
      pageConfig = { title: 'Syrups', data: productData.syrups };
      break;
    case 'page-sachets':
      pageConfig = { title: 'Sachets', data: productData.sachets };
      break;
    default:
      return; // Exit if not a product page
  }
  
  sourceData = pageConfig.data;
  pageTitleEl.textContent = pageConfig.title;

  function displayTable(data, page) {
    tableBody.innerHTML = '';
    page = page - 1;

    const start = rowsPerPage * page;
    const end = start + rowsPerPage;
    const paginatedItems = data.slice(start, end);

    paginatedItems.forEach((item, index) => {
      const row = document.createElement('tr');
      const srNo = start + index + 1;
      row.innerHTML = `
        <td>${srNo}</td>
        <td>${item.name}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  function setupPagination(data) {
    paginationWrapper.innerHTML = '';
    const pageCount = Math.ceil(data.length / rowsPerPage);
    
    // Create the pagination controls
    const controls = document.createElement('div');
    controls.className = 'pagination-controls';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'Previous';
    prevBtn.classList.add('pagination-btn', 'nav-btn');
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updateDisplay();
      }
    });

    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${currentPage} of ${pageCount}`;

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Next';
    nextBtn.classList.add('pagination-btn', 'nav-btn');
    nextBtn.disabled = currentPage === pageCount;
    nextBtn.addEventListener('click', () => {
      if (currentPage < pageCount) {
        currentPage++;
        updateDisplay();
      }
    });

    // Append all elements
    controls.appendChild(prevBtn);
    controls.appendChild(pageInfo);
    controls.appendChild(nextBtn);
    paginationWrapper.appendChild(controls);
  }

  function updateDisplay() {
    displayTable(filteredData, currentPage);
    setupPagination(filteredData);
  }

  function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredData = sourceData.filter(item => 
      item.name.toLowerCase().includes(searchTerm)
    );
    currentPage = 1; // Reset to first page after search
    updateDisplay();
  }

  function handlePageSizeChange() {
    rowsPerPage = parseInt(pageSizeSelect.value);
    currentPage = 1; // Reset to first page when changing page size
    updateDisplay();
  }
  
  // Event Listeners
  searchInput.addEventListener('input', handleSearch);
  pageSizeSelect.addEventListener('change', handlePageSizeChange);

  // Initial Load
  filteredData = sourceData;
  displayTable(sourceData, currentPage);
  setupPagination(sourceData);
});