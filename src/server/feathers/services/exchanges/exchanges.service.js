// Initializes the `exchanges` service on path `/exchanges`
const createService = require('feathers-mongoose')
const createModel = require('../../../mongoose/models/exchange.model')
const hooks = require('./exchanges.hooks')
const filters = require('./exchanges.filters')

module.exports = function () {
  const app = this
  const Model = createModel(app).model
  const paginate = app.get('paginate')

  const options = {
    name: 'exchanges',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/exchanges', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('exchanges')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
