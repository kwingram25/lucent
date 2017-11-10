// Initializes the `wallets` service on path `/wallets`
const createService = require('feathers-mongoose')
const createModel = require('../../../mongoose/models/wallet.model')
const hooks = require('./wallets.hooks')
const filters = require('./wallets.filters')

module.exports = function () {
  const app = this
  const Models = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'wallets',
    Model: Models.Wallet,
    paginate,
    discriminators: [Models.ExchangeWallet]
  }

  // Initialize our service with any options it requires
  app.use('/wallets', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('wallets')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
