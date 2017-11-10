// contact-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

module.exports = function (app) {
  const mongoose = app.get('mongooseClient')
  const Schema = mongoose.Schema

  const walletSchema = new Schema({
    name: {
      type: String
    },
    address: {
      type: String
    }
  })

  const Wallet = mongoose.model('wallet', walletSchema)

  const exchangeWalletSchema = new Schema(
    {
      exchange: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exchange'
      }
    }
  )

  const ExchangeWallet = Wallet.discriminator('Exchange', exchangeWalletSchema)

  return {
    Wallet: Wallet,
    ExchangeWallet: ExchangeWallet
  }
}
