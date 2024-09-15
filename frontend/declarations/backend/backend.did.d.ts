import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Stock {
  'purchasePrice' : number,
  'name' : string,
  'quantity' : bigint,
  'symbol' : string,
}
export interface _SERVICE {
  'addStock' : ActorMethod<[string, string, bigint, number], undefined>,
  'getAllStocks' : ActorMethod<[], Array<Stock>>,
  'init' : ActorMethod<[], undefined>,
  'removeStock' : ActorMethod<[string], boolean>,
  'updateStock' : ActorMethod<[string, bigint, number], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
