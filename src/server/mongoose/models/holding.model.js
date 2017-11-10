
module.exports = function (app) {
  const mongoose = app.get('mongooseClient')
  const Schema = mongoose.Schema

  const holdingSchema = new Schema({
    portfolio: {
      type: Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true
    },
    currency: {
      type: Schema.Types.ObjectId,
      ref: 'Currency',
      required: true
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet'
    },
    visible: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      required: true
    },
    value: {
      current: {
        perUnit: {
          type: Number,
          default: 0,
          min: 0
        },
        total: {
          type: Number,
          default: 0
        }
      },
      histo: {
        error: {
          type: Boolean,
          default: false
        },
        perUnit: {
          type: Number,
          default: 0,
          min: 0
        },
        total: {
          type: Number,
          default: 0
        }
      }
    },
    groupIndex: {
      type: Number,
      default: -1,
      required: true
    },
    index: {
      type: Number,
      default: -1,
      required: true
    },
    history: [{
      date: {
        type: Date,
        required: true
      },
      diff: {
        type: Number,
        required: true
      },
      transaction: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
      }
    }]
  })

  return mongoose.model('holding', holdingSchema)
}
