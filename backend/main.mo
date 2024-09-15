import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Array "mo:base/Array";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

actor StockHolding {
    // Define the Stock type
    public type Stock = {
        symbol: Text;
        name: Text;
        quantity: Nat;
        purchasePrice: Float;
    };

    // Use a stable variable to store stocks
    private stable var stocksEntries : [(Text, Stock)] = [];
    private var stocks = HashMap.HashMap<Text, Stock>(10, Text.equal, Text.hash);

    // Initialize the stocks HashMap from stable storage
    private func loadStocks() {
        for ((k, v) in stocksEntries.vals()) {
            stocks.put(k, v);
        }
    };

    // Constructor
    public func init() : async () {
        loadStocks();
    };

    // Add a new stock
    public func addStock(symbol: Text, name: Text, quantity: Nat, purchasePrice: Float) : async () {
        let stock : Stock = {
            symbol = symbol;
            name = name;
            quantity = quantity;
            purchasePrice = purchasePrice;
        };
        stocks.put(symbol, stock);
    };

    // Update an existing stock
    public func updateStock(symbol: Text, quantity: Nat, purchasePrice: Float) : async Bool {
        switch (stocks.get(symbol)) {
            case (null) { false };
            case (?stock) {
                let updatedStock : Stock = {
                    symbol = stock.symbol;
                    name = stock.name;
                    quantity = quantity;
                    purchasePrice = purchasePrice;
                };
                stocks.put(symbol, updatedStock);
                true
            };
        };
    };

    // Remove a stock
    public func removeStock(symbol: Text) : async Bool {
        switch (stocks.remove(symbol)) {
            case (null) { false };
            case (?_) { true };
        };
    };

    // Get all stocks
    public query func getAllStocks() : async [Stock] {
        Iter.toArray(stocks.vals())
    };

    // Pre-upgrade hook to save stocks to stable storage
    system func preupgrade() {
        stocksEntries := Iter.toArray(stocks.entries());
    };

    // Post-upgrade hook to reload stocks from stable storage
    system func postupgrade() {
        loadStocks();
    };
}