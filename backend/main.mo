import Bool "mo:base/Bool";
import Trie "mo:base/Trie";

import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Float "mo:base/Float";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import TrieMap "mo:base/TrieMap";
import Char "mo:base/Char";

actor {
  public type Asset = {
    id: Nat;
    symbol: Text;
    name: Text;
    quantity: Float;
    assetType: Text;
  };

  stable var assetsEntries : [(Nat, Asset)] = [];
  var assets = TrieMap.fromEntries<Nat, Asset>(assetsEntries.vals(), Nat.equal, Nat.hash);
  stable var nextId: Nat = 1;

  func assetToJSON(a: Asset): Text {
    "{\"id\":" # Nat.toText(a.id) # 
    ",\"symbol\":\"" # a.symbol # 
    "\",\"name\":\"" # a.name # 
    "\",\"quantity\":" # Float.toText(a.quantity) # 
    ",\"assetType\":\"" # a.assetType # "\"}";
  };

  func assetsToJSON(): Text {
    let jsonAssets = Array.map<Asset, Text>(
      Iter.toArray(assets.vals()),
      func (a: Asset): Text { assetToJSON(a) }
    );
    "[" # Array.foldLeft<Text, Text>(jsonAssets, "", func(acc, x) { 
      if (acc == "") { x } else { acc # "," # x }
    }) # "]";
  };

  func toUppercase(t: Text): Text {
    Text.map(t, func (c: Char): Char {
      if (Char.isLowercase(c)) {
        Char.fromNat32(Char.toNat32(c) - 32);
      } else {
        c
      };
    });
  };

  public query func getAssets() : async Text {
    Debug.print("Fetching assets");
    assetsToJSON();
  };

  public shared(msg) func addAsset(symbol: Text, name: Text, quantity: Float, assetType: Text) : async Text {
    Debug.print("Adding asset: " # symbol);
    let newAsset: Asset = {
      id = nextId;
      symbol = toUppercase(symbol);
      name = name;
      quantity = quantity;
      assetType = assetType;
    };
    assets.put(nextId, newAsset);
    nextId += 1;
    assetToJSON(newAsset);
  };

  public shared(msg) func updateAsset(id: Nat, symbol: Text, name: Text, quantity: Float, assetType: Text) : async ?Text {
    switch (assets.get(id)) {
      case (null) { null };
      case (?existingAsset) {
        let updatedAsset: Asset = {
          id = id;
          symbol = toUppercase(symbol);
          name = name;
          quantity = quantity;
          assetType = assetType;
        };
        assets.put(id, updatedAsset);
        ?assetToJSON(updatedAsset);
      };
    };
  };

  public shared(msg) func deleteAsset(id: Nat) : async Bool {
    switch (assets.remove(id)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  system func preupgrade() {
    assetsEntries := Iter.toArray(assets.entries());
  };

  system func postupgrade() {
    assets := TrieMap.fromEntries(assetsEntries.vals(), Nat.equal, Nat.hash);
    assetsEntries := [];
  };
};