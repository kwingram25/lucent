// Initializes the `tokens` service on path `/tokens`
const createService = require('feathers-mongoose')
const createModel = require('../../../mongoose/models/currency.model')
const hooks = require('./currencies.hooks')
const filters = require('./currencies.filters')

module.exports = function () {
  const app = this
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'currencies',
    Model: Model.Currency,
    discriminators: [Model.Token, Model.Fiat],
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/currencies', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('currencies')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
