import { backend } from 'declarations/backend';

document.addEventListener('DOMContentLoaded', async () => {
    const addStockForm = document.getElementById('addStockForm');
    const stocksTable = document.getElementById('stocksTable').getElementsByTagName('tbody')[0];

    addStockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const symbol = document.getElementById('symbol').value;
        const name = document.getElementById('name').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);

        await backend.addStock(symbol, name, quantity, purchasePrice);
        addStockForm.reset();
        await updateStocksList();
    });

    async function updateStocksList() {
        const stocks = await backend.getAllStocks();
        stocksTable.innerHTML = '';
        stocks.forEach(stock => {
            const row = stocksTable.insertRow();
            row.innerHTML = `
                <td>${stock.symbol}</td>
                <td>${stock.name}</td>
                <td>${stock.quantity}</td>
                <td>${stock.purchasePrice.toFixed(2)}</td>
                <td>
                    <button onclick="updateStock('${stock.symbol}')">Update</button>
                    <button onclick="removeStock('${stock.symbol}')">Remove</button>
                </td>
            `;
        });
    }

    window.updateStock = async (symbol) => {
        const quantity = prompt('Enter new quantity:');
        const purchasePrice = prompt('Enter new purchase price:');
        if (quantity && purchasePrice) {
            await backend.updateStock(symbol, parseInt(quantity), parseFloat(purchasePrice));
            await updateStocksList();
        }
    };

    window.removeStock = async (symbol) => {
        if (confirm('Are you sure you want to remove this stock?')) {
            await backend.removeStock(symbol);
            await updateStocksList();
        }
    };

    await updateStocksList();
});