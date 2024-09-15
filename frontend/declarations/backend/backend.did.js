export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addAsset' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64, IDL.Text],
        [IDL.Text],
        [],
      ),
    'deleteAsset' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'getAssets' : IDL.Func([], [IDL.Text], ['query']),
    'updateAsset' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Float64, IDL.Text],
        [IDL.Opt(IDL.Text)],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
