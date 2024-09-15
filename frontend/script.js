// Initialize Feather Icons
feather.replace();

let assets = [];

// Load assets from localStorage
function loadAssets() {
    const storedAssets = localStorage.getItem('assets');
    if (storedAssets) {
        assets = JSON.parse(storedAssets);
    }
}

// Save assets to localStorage
function saveAssets() {
    localStorage.setItem('assets', JSON.stringify(assets));
}

// Fetch assets (now from localStorage)
async function fetchAssets() {
    try {
        console.log("Fetching assets...");
        loadAssets();
        console.log("Loaded assets:", assets);
        displayHoldings();
        updateCharts();
    } catch (error) {
        console.error('Error fetching assets:', error);
        alert('Failed to fetch assets. Please check the console for more details.');
    }
}

// Display holdings in the table
async function displayHoldings() {
    const holdingsBody = document.getElementById('holdings-body');
    holdingsBody.innerHTML = '';

    for (const asset of assets) {
        const marketData = await fetchMarketData(asset.symbol);
        const marketPrice = marketData.currentPrice;
        const marketValue = marketPrice * asset.quantity;
        const totalGainValue = marketValue - (asset.purchasePrice * asset.quantity);
        const totalGainPercent = (totalGainValue / (asset.purchasePrice * asset.quantity)) * 100;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="stock-symbol">${asset.symbol}</span> ${asset.name}</td>
            <td>${asset.quantity}</td>
            <td>$${asset.purchasePrice.toFixed(2)}</td>
            <td>$${marketValue.toFixed(2)}</td>
            <td>$${marketPrice.toFixed(2)}</td>
            <td class="${totalGainValue >= 0 ? 'positive' : 'negative'}">
                ${totalGainPercent >= 0 ? '+' : ''}${totalGainPercent.toFixed(2)}%<br>
                $${totalGainValue.toFixed(2)}
            </td>
            <td>${asset.assetType}</td>
        `;
        holdingsBody.appendChild(row);
    }
}

// Fetch market data from a public API
async function fetchMarketData(symbol) {
    try {
        // Use a public API like Finnhub or Alpha Vantage
        // For this example, we'll use Alpha Vantage
        const apiKey = 'YOUR_ALPHA_VANTAGE_API_KEY'; // Replace with your API key
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        const quote = data['Global Quote'];
        return {
            currentPrice: parseFloat(quote['05. price']),
            previousClose: parseFloat(quote['08. previous close']),
        };
    } catch (error) {
        console.error('Error fetching market data:', error);
        return {
            currentPrice: 0,
            previousClose: 0,
        };
    }
}

// Function to switch between Holdings and Allocations pages
function showPage(pageName) {
    console.log("Showing page:", pageName);
    const pages = document.querySelectorAll('#holdings-page, #allocations-page');
    const tabs = document.querySelectorAll('.tab');

    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === `${pageName}-page`) {
            page.classList.add('active');
        }
    });

    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase() === pageName) {
            tab.classList.add('active');
        }
    });

    if (pageName === 'allocations') {
        updateCharts();
    }
}

// Show Add Asset Modal
function showAddAssetModal() {
    console.log("Showing add asset modal");
    const modal = document.getElementById('add-asset-modal');
    modal.style.display = 'block';
}

// Close Add Asset Modal
function closeAddAssetModal() {
    console.log("Closing add asset modal");
    const modal = document.getElementById('add-asset-modal');
    modal.style.display = 'none';
    document.getElementById('add-asset-form').reset();
}

// Handle Add Asset Form Submission
document.getElementById('add-asset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Add asset form submitted");
    const symbol = document.getElementById('symbol').value.toUpperCase();
    const name = document.getElementById('name').value;
    const quantity = parseFloat(document.getElementById('quantity').value);
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
    const type = document.getElementById('type').value;

    try {
        console.log("Adding asset:", { symbol, name, quantity, purchasePrice, type });
        const newAsset = { symbol, name, quantity, purchasePrice, assetType: type };
        assets.push(newAsset);
        saveAssets();
        displayHoldings();
        updateCharts();
        closeAddAssetModal();
    } catch (error) {
        console.error('Error adding asset:', error);
        alert('Failed to add asset. Please check the console for more details.');
    }
});

// Update Charts
async function updateCharts() {
    console.log("Updating charts");
    // Allocation Chart
    const assetTypes = {};
    for (const asset of assets) {
        if (!assetTypes[asset.assetType]) {
            assetTypes[asset.assetType] = 0;
        }
        const marketData = await fetchMarketData(asset.symbol);
        const marketValue = marketData.currentPrice * asset.quantity;
        assetTypes[asset.assetType] += marketValue;
    }

    const allocationLabels = Object.keys(assetTypes);
    const allocationData = Object.values(assetTypes);

    const allocationChartCtx = document.getElementById('allocationChart').getContext('2d');
    new Chart(allocationChartCtx, {
        type: 'doughnut',
        data: {
            labels: allocationLabels,
            datasets: [{
                data: allocationData,
                backgroundColor: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        boxWidth: 15
                    }
                }
            }
        }
    });

    // Performance Chart
    const performanceLabels = assets.map(asset => asset.symbol);
    const performanceData = [];
    for (const asset of assets) {
        const marketData = await fetchMarketData(asset.symbol);
        const marketPrice = marketData.currentPrice;
        const marketValue = marketPrice * asset.quantity;
        const totalGainValue = marketValue - (asset.purchasePrice * asset.quantity);
        performanceData.push(totalGainValue);
    }

    const performanceChartCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceChartCtx, {
        type: 'bar',
        data: {
            labels: performanceLabels,
            datasets: [{
                label: 'Performance ($)',
                data: performanceData,
                backgroundColor: performanceData.map(value => value >= 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)'),
                borderColor: performanceData.map(value => value >= 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded");
    // Start with the Holdings page active
    showPage('holdings');
    fetchAssets();
});

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('add-asset-modal');
    if (event.target == modal) {
        closeAddAssetModal();
    }
};

// Expose functions to window object for HTML onclick attributes
window.showAddAssetModal = showAddAssetModal;
window.closeAddAssetModal = closeAddAssetModal;
window.showPage = showPage;