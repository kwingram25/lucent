// contact-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient')
  const Schema = mongooseClient.Schema

  const currencySchema = new Schema({
    id: {
      required: true,
      type: String,
      unique: true
    },
    name: {
      required: true,
      type: String
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    symbol: {
      type: String
    },
    isBase: {
      type: Boolean,
      required: true,
      default: false
    }
  })

  const tokenSchema = new Schema({
    imageId: {
      type: String
    }
  })
  const fiatSchema = new Schema({})

  const Currency = mongooseClient.model('currency', currencySchema)

  return {
    Currency: Currency,
    Token: Currency.discriminator('Token', tokenSchema),
    Fiat: Currency.discriminator('Fiat', fiatSchema)
  }
}
