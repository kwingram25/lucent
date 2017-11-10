// contact-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

module.exports = function (app) {
  const mongoose = app.get('mongooseClient')

  const exchangeSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  })

  const Exchange = mongoose.model('exchange', exchangeSchema)

  return {
    model: Exchange,
    schema: exchangeSchema
  }
}
