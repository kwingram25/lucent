// Initializes the `exchanges` service on path `/exchanges`
const createService = require('feathers-mongoose')
const createModel = require('../../../mongoose/models/transaction.model')
const hooks = require('./transactions.hooks')
const filters = require('./transactions.filters')

module.exports = function () {
  const app = this
  const {Transaction, Trade, Transfer} = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'transactions',
    Model: Transaction,
    paginate,
    discriminators: [Trade, Transfer]
  }

  // Initialize our service with any options it requires
  app.use('/transactions', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('transactions')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
