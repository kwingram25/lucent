// Initializes the `holding` service on path `/holdings`
const createService = require('feathers-mongoose')
const createModel = require('../../../mongoose/models/holding.model')
const hooks = require('./holdings.hooks')
const filters = require('./holdings.filters')

module.exports = function () {
  const app = this
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'holdings',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  // app.use('/holdings', {
  //   find: (id, params) => {
  //     const groupBy = params.groupBy ? params.groupBy : 'EXCHANGE';
  //     return Promise.resolve(mockHoldings);
  //   }
  // })
  app.use('/holdings', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('holdings')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
