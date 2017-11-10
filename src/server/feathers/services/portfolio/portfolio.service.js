// Initializes the `portfolio` service on path `/portfolio`
const createService = require('feathers-mongoose')
const createModel = require('../../../mongoose/models/portfolio.model')
const hooks = require('./portfolio.hooks')
const filters = require('./portfolio.filters')

module.exports = function () {
  const app = this
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'portfolio',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/portfolio', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('portfolio')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
