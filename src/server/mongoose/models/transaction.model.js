// contact-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

module.exports = function (app) {
  const mongoose = app.get('mongooseClient')
  const Schema = mongoose.Schema

  const transactionSchema = new Schema({
    portfolio: {
      type: Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now()
    }
  })

  const Transaction = mongoose.model('transaction', transactionSchema)

  const tradeTypes = ['BUY', 'SELL']

  const tradeSchema = new Schema({
    type: {
      type: String,
      enum: tradeTypes,
      required: true
    },
    exchange: {
      type: Schema.Types.ObjectId,
      ref: 'Exchange',
      required: true
    },
    pair: {
      buying: {
        currency: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Currency',
          required: true
        },
        wallet: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ExchangeWallet'
        },
        quantity: {
          type: Number,
          required: true,
          min: 0
        }
      },
      selling: {
        currency: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Currency',
          required: true
        },
        wallet: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ExchangeWallet'
        },
        quantity: {
          type: Number,
          required: true,
          min: 0
        }
      }
    },
    rate: {
      type: Number,
      min: 0
    },
    fee: {
      type: Number,
      min: 0
    }
  })

  const Trade = Transaction.discriminator('Trade', tradeSchema)

  const transferSchema = new Schema(
    {
      portfolio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio',
        required: true
      },
      currency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Currency',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 0
      },
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet'
      },
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet'
      },
      fee: {
        type: Number,
        min: 0,
        default: 0
      }
    }
  )

  const Transfer = Transaction.discriminator('Transfer', transferSchema)

  return {
    Transaction,
    Trade,
    Transfer
  }
}
