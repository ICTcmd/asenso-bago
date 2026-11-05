// Legislative Documents Data Loader
// Data parsed from DOWNLOAD_REPORT.CSV in BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED

const legislativeData = `year,document_title,document_type,filename,status,saved_path,source_url
2024,ORDINANCE NO. 24-01,ORDINANCES,ORDINANCE_24-01.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-01.pdf,https://drive.google.com/file/d/1m-FasX8AJT6I_fN1GTa3UQVGu3UXEy8q/view?usp=drive_link
2024,ORDINANCE NO. 24-02,ORDINANCES,ORDINANCE_24-02.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-02.pdf,https://drive.google.com/file/d/1NNoNb7Nc0qOwMHj0qKnRQnZyPiGyr343/view?usp=drive_link
2024,ORDINANCE NO. 24-03,ORDINANCES,ORDINANCE_24-03.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-03.pdf,https://drive.google.com/file/d/1ihzx9Dyxl1oLxCDCgFii2_dBMQ_eosbu/view?usp=drive_link
2024,ORDINANCE NO. 24-04,ORDINANCES,ORDINANCE_24-04.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-04.pdf,https://drive.google.com/file/d/1OGpZa981NFgJ9A5J5NHYHq2yKnIupnsy/view?usp=drive_link
2024,ORDINANCE NO. 24-05,ORDINANCES,ORDINANCE_24-05.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-05.pdf,https://drive.google.com/file/d/1aF_mdiw_xYebyXOmCGbFpy2DOY83nfVg/view?usp=drive_link
2024,ORDINANCE NO. 24-06,ORDINANCES,ORDINANCE_24-06.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-06.pdf,https://drive.google.com/file/d/1rqS4jpYLjoO0WSL71wTwqEZWjYadXirI/view?usp=drive_link
2024,ORDINANCE NO. 24-07,ORDINANCES,ORDINANCE_24-07.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-07.pdf,https://drive.google.com/file/d/1MW2BLBiYp2VYuNdN6kZ8-qYtMLBMZEW8/view?usp=drive_link
2024,ORDINANCE NO. 24-08,ORDINANCES,ORDINANCE_24-08.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-08.pdf,https://drive.google.com/file/d/1zjjWmCKOFAKat4a0Fbxcb2XIEcpZxbgU/view?usp=drive_link
2024,ORDINANCE NO. 24-09,ORDINANCES,ORDINANCE_24-09.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-09.pdf,https://drive.google.com/file/d/1y4dt5DO7zRMShP76ZyReHAbz3_nC7Ksl/view?usp=drive_link
2024,ORDINANCE NO. 24-10,ORDINANCES,ORDINANCE_24-10.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-10.pdf,https://drive.google.com/file/d/1_6Kf5XCtwl3ivPi5ZP3gCGIXyUvpEZhf/view?usp=drive_link
2024,ORDINANCE NO. 24-11,ORDINANCES,ORDINANCE_24-11.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-11.pdf,https://drive.google.com/file/d/1agUUlSS71a-_PbiwUNFcxEVpnVihpixn/view?usp=drive_link
2024,ORDINANCE NO. 24-12,ORDINANCES,ORDINANCE_24-12.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-12.pdf,https://drive.google.com/file/d/1aHMBBn13ME-HZX1QiPhgWT-EMRuYsA-x/view?usp=drive_link
2024,ORDINANCE NO. 24-13,ORDINANCES,ORDINANCE_24-13.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-13.pdf,https://drive.google.com/file/d/19b8r1wj6QRxXRFiR6v1gwZSCOdJU7vwL/view?usp=drive_link
2024,ORDINANCE NO. 24-14,ORDINANCES,ORDINANCE_24-14.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-14.pdf,https://drive.google.com/file/d/1_FdcRpZ_xV8Cq9z2LgyPN2vATC4dKfDx/view?usp=drive_link
2024,ORDINANCE NO. 24-15,ORDINANCES,ORDINANCE_24-15.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-15.pdf,https://drive.google.com/file/d/1ZBTGhFB5b0JN04i5-6iIBOdAmeg2vrC9/view?usp=drive_link
2024,ORDINANCE NO. 24-16,ORDINANCES,ORDINANCE_24-16.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-16.pdf,https://drive.google.com/file/d/1QBOBQMggfBZGbSi0DupH_S3NuzYSULVT/view?usp=drive_link
2024,ORDINANCE NO. 24-17,ORDINANCES,ORDINANCE_24-17.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-17.pdf,https://drive.google.com/file/d/1GcUOQyVPtE4RyJf7HyW-t0x2ztX1HxJQ/view?usp=drive_link
2024,ORDINANCE NO. 24-18,ORDINANCES,ORDINANCE_24-18.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-18.pdf,https://drive.google.com/file/d/1gpD4Ng6kC9KDWvYhB8QQWsu9pvuZlf0y/view?usp=drive_link
2024,ORDINANCE NO. 24-19,ORDINANCES,ORDINANCE_24-19.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-19.pdf,https://drive.google.com/file/d/1tzzcBX-dZ-eHkeJCCaY_vkLc01wjrRKD/view?usp=drive_link
2024,ORDINANCE NO. 24-20,ORDINANCES,ORDINANCE_24-20.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-20.pdf,https://drive.google.com/file/d/1yB1YMJRc6hPGVVGoEdJFFrzGagUxHRck/view?usp=drive_link
2024,ORDINANCE NO. 24-21,ORDINANCES,ORDINANCE_24-21.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-21.pdf,https://drive.google.com/file/d/13pRPsSAYgWfmhRjgoRWBjsz52uWkO-NZ/view?usp=drive_link
2024,ORDINANCE NO. 24-22,ORDINANCES,ORDINANCE_24-22.pdf,DOWNLOADED,C:\\Users\\OJTBEEG\\Desktop\\bago brgy achive\\BAGO_CITY_LEGISLATIVE_ARCHIVE_NAMED\\2024\\ORDINANCES\\ORDINANCE_24-22.pdf,https://drive.google.com/file/d/1M3inEUSUhJCVyH_C1x1x9AocS_am2_TY/view?usp=drive_link`;

// Parse CSV data into structured format
function parseCSVData(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const documents = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse CSV line handling commas in paths
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const doc = {
      year: values[0],
      title: values[1],
      type: values[2],
      filename: values[3],
      status: values[4],
      path: values[5],
      url: values[6]
    };

    documents.push(doc);
  }

  return documents;
}

// State
let allDocuments = [];
let filteredDocuments = [];
let activeYear = 'all';
let activeType = 'all';
let searchQuery = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Parse data
  allDocuments = parseCSVData(legislativeData);
  console.log(`Loaded ${allDocuments.length} documents`);

  // Setup event listeners
  setupFilters();
  setupSearch();

  // Initial render
  filterAndRender();
});

// Setup year and type filters
function setupFilters() {
  // Year filters
  const yearTabs = document.querySelectorAll('#yearFilters .filter-tab');
  yearTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      yearTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeYear = tab.getAttribute('data-year');
      filterAndRender();
    });
  });

  // Type filters
  const typeTabs = document.querySelectorAll('#typeFilters .filter-tab');
  typeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      typeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeType = tab.getAttribute('data-type');
      filterAndRender();
    });
  });
}

// Setup search
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    filterAndRender();
  });
}

// Filter and render documents
function filterAndRender() {
  // Apply filters
  filteredDocuments = allDocuments.filter(doc => {
    // Year filter
    if (activeYear !== 'all' && doc.year !== activeYear) {
      return false;
    }

    // Type filter
    if (activeType !== 'all' && doc.type !== activeType) {
      return false;
    }

    // Search filter
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery)) {
      return false;
    }

    return true;
  });

  renderDocuments();
}

// Render documents
function renderDocuments() {
  const container = document.getElementById('documentsContainer');

  if (filteredDocuments.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 style="font-size: 1.125rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">No Documents Found</h3>
        <p>Try adjusting your filters or search query</p>
      </div>
    `;
    return;
  }

  // Group by year
  const groupedByYear = {};
  filteredDocuments.forEach(doc => {
    if (!groupedByYear[doc.year]) {
      groupedByYear[doc.year] = [];
    }
    groupedByYear[doc.year].push(doc);
  });

  // Sort years in descending order
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a);

  // Build HTML
  let html = '';
  sortedYears.forEach(year => {
    const docs = groupedByYear[year];
    html += `
      <div class="year-group">
        <div class="year-header">${year} (${docs.length} document${docs.length !== 1 ? 's' : ''})</div>
        ${docs.map(doc => createDocumentCard(doc)).join('')}
      </div>
    `;
  });

  html += `<div class="document-count">Showing ${filteredDocuments.length} of ${allDocuments.length} documents</div>`;

  container.innerHTML = html;
}

// Create document card HTML
function createDocumentCard(doc) {
  const badgeClass = doc.type === 'ORDINANCES' ? 'badge-ordinance' : 'badge-resolution';
  const badgeText = doc.type === 'ORDINANCES' ? 'Ordinance' : 'Resolution';

  // Convert Google Drive view link to direct download link
  const fileId = doc.url.match(/\/d\/([^/]+)/)?.[1];
  const directLink = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : doc.url;

  return `
    <div class="document-card" onclick="window.open('${doc.url}', '_blank')">
      <div class="document-header">
        <div class="document-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="document-content">
          <div class="document-title">${doc.title}</div>
          <div class="document-meta">
            <span class="document-badge ${badgeClass}">${badgeText}</span>
            <span class="document-year">${doc.year}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
