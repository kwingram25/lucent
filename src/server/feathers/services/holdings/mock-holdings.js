
module.exports.mockHoldings = [
  {
    "_id": 1,
    "token": {
      "id": "bitcoin",
      "name": "Bitcoin",
      "symbol": "BTC"
    },
    "wallet": {
      "name": "Coinbase Wallet BTC",
      "address": "1EiqTrkPbiRP4eAuCDDEJ3xmQnWVF4KHvX",
      "kind": "ExchangeWallet",
      "exchange": {
        "id": "coinbase",
        "name": "Coinbase",
        "url": "http://www.coinbase.com"
      }
    },
    "quantity": 2.00
  },
  {
    "_id": 2,
    "token": {
      "id": "bitcoin",
      "name": "Bitcoin",
      "symbol": "BTC"
    },
    "wallet": {
      "name": "My Offline",
      "address": "1EiqTrkPbiRP4eAuCDDEJ3xmQnWVF4KHvX",
    },
    "quantity": 1.25
  },
  {
    "_id": 3,
    "token": {
      "id": "ethereum",
      "name": "Ethereum",
      "symbol": "ETH"
    },
    "wallet": {
      "name": "Coinbase Wallet ETH",
      "address": "0x10B27f72A3ff2019f088FbE9De4bB7b92B85ED4d",
      "kind": "ExchangeWallet",
      "exchange": {
        "id": "coinbase",
        "name": "Coinbase",
        "url": "http://www.coinbase.com"
      }
    },
    "quantity": 60.00
  }
];
