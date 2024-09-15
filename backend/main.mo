import Text "mo:base/Text";

import Debug "mo:base/Debug";

actor {
  public func greet(name : Text) : async Text {
    Debug.print("Hello, " # name # "!");
    return "Hello, " # name # "!";
  };
};