feather.replace();

let assets = [];
let allocationChart = null;
let performanceChart = null;

function loadAssets() {
    const storedAssets = localStorage.getItem('assets');
    if (storedAssets) {
        assets = JSON.parse(storedAssets);
    }
}

function saveAssets() {
    localStorage.setItem('assets', JSON.stringify(assets));
}

async function fetchAssets() {
    try {
        console.log("Fetching assets...");
        loadAssets();
        console.log("Loaded assets:", assets);
        await displayHoldings();
        updateCharts();
    } catch (error) {
        console.error('Error fetching assets:', error);
        alert('Failed to fetch assets. Please check the console for more details.');
    }
}

async function displayHoldings() {
    const holdingsBody = document.getElementById('holdings-body');
    holdingsBody.innerHTML = '';

    for (const asset of assets) {
        const marketData = await fetchMarketData(asset.symbol);
        const marketPrice = marketData?.currentPrice ?? 0;
        const marketValue = marketPrice * asset.quantity;
        const totalGainValue = marketValue - (asset.purchasePrice * asset.quantity);
        const totalGainPercent = asset.purchasePrice > 0 ? (totalGainValue / (asset.purchasePrice * asset.quantity)) * 100 : 0;

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

async function fetchMarketData(symbol) {
    try {
        // Mock API call for development
        return {
            currentPrice: Math.random() * 1000,
            previousClose: Math.random() * 1000,
        };
    } catch (error) {
        console.error('Error fetching market data:', error);
        return {
            currentPrice: 0,
            previousClose: 0,
        };
    }
}

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

function showAddAssetModal() {
    console.log("Showing add asset modal");
    const modal = document.getElementById('add-asset-modal');
    modal.style.display = 'block';
}

function closeAddAssetModal() {
    console.log("Closing add asset modal");
    const modal = document.getElementById('add-asset-modal');
    modal.style.display = 'none';
    document.getElementById('add-asset-form').reset();
}

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
        await displayHoldings();
        updateCharts();
        closeAddAssetModal();
    } catch (error) {
        console.error('Error adding asset:', error);
        alert('Failed to add asset. Please check the console for more details.');
    }
});

async function updateCharts() {
    console.log("Updating charts");
    const assetTypes = {};
    const performanceData = [];
    const performanceLabels = [];

    for (const asset of assets) {
        if (!assetTypes[asset.assetType]) {
            assetTypes[asset.assetType] = 0;
        }
        const marketData = await fetchMarketData(asset.symbol);
        const marketValue = (marketData?.currentPrice ?? 0) * asset.quantity;
        assetTypes[asset.assetType] += marketValue;

        const totalGainValue = marketValue - (asset.purchasePrice * asset.quantity);
        performanceData.push(totalGainValue);
        performanceLabels.push(asset.symbol);
    }

    const allocationLabels = Object.keys(assetTypes);
    const allocationData = Object.values(assetTypes);

    updateAllocationChart(allocationLabels, allocationData);
    updatePerformanceChart(performanceLabels, performanceData);
}

function updateAllocationChart(labels, data) {
    const ctx = document.getElementById('allocationChart').getContext('2d');
    if (allocationChart) {
        allocationChart.destroy();
    }
    allocationChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
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
}

function updatePerformanceChart(labels, data) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    if (performanceChart) {
        performanceChart.destroy();
    }
    performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Performance ($)',
                data: data,
                backgroundColor: data.map(value => value >= 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)'),
                borderColor: data.map(value => value >= 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'),
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

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded");
    showPage('holdings');
    fetchAssets();
});

window.onclick = function(event) {
    const modal = document.getElementById('add-asset-modal');
    if (event.target == modal) {
        closeAddAssetModal();
    }
};

window.showAddAssetModal = showAddAssetModal;
window.closeAddAssetModal = closeAddAssetModal;
window.showPage = showPage;