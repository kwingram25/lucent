import moment from 'moment'
import config from '../../../common/config'

module.exports = function (app) {
  const mongoose = app.get('mongooseClient')
  const Schema = mongoose.Schema

  const periods = config.periods

  let historySchema = {}
  periods.forEach(per => {
    historySchema[per] = {
      updatedAt: {
        type: Date
      },
      error: {
        type: Boolean,
        default: false
      },
      data: [{
        date: {
          type: Date,
          required: true
        },
        value: {
          type: Number,
          required: true
        }
      }]
    }
  })

  const portfolioSchema = new Schema({
    groupBy: {
      type: String,
      enum: ['TOKEN', 'EXCHANGE'],
      required: true
    },
    period: {
      type: String,
      enum: periods,
      required: true
    },
    currency: {
      type: Schema.Types.ObjectId,
      ref: 'Currency',
      required: true
    },
    value: {
      current: {
        type: Number,
        default: 0
      },
      histo: {
        type: Number,
        default: 0
      },
      diff: {
        type: Number,
        default: 0
      }
    },
    history: historySchema,
    updatedAt: {
      compare: {
        type: Date,
        default: moment().subtract(1, 'week')
      }
    },
    createdAt: {
      type: Date,
      default: moment()
    },
    firstActivity: {
      type: Date,
      default: moment()
    },
    demo: {
      type: Boolean,
      default: false
    }
  })

  return mongoose.model('portfolio', portfolioSchema)
}
