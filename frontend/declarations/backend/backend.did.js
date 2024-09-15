export const idlFactory = ({ IDL }) => {
  const Stock = IDL.Record({
    'purchasePrice' : IDL.Float64,
    'name' : IDL.Text,
    'quantity' : IDL.Nat,
    'symbol' : IDL.Text,
  });
  return IDL.Service({
    'addStock' : IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Float64], [], []),
    'getAllStocks' : IDL.Func([], [IDL.Vec(Stock)], ['query']),
    'init' : IDL.Func([], [], []),
    'removeStock' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'updateStock' : IDL.Func([IDL.Text, IDL.Nat, IDL.Float64], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
