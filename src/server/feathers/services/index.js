const holdings = require('./holdings/holdings.service.js')
const wallets = require('./wallets/wallets.service.js')
const currencies = require('./currencies/currencies.service.js')
const exchanges = require('./exchanges/exchanges.service.js')
const portfolio = require('./portfolio/portfolio.service.js')
const transactions = require('./transactions/transactions.service.js')

module.exports = function () {
  const app = this // eslint-disable-line no-unused-vars
  app.configure(holdings)
  app.configure(wallets)
  app.configure(currencies)
  app.configure(exchanges)
  app.configure(transactions)
  app.configure(portfolio)
}
