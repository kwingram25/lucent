const { populate, paramsFromClient, iff, stashBefore } = require('feathers-hooks-common')
const moment = require('moment')
const _ = require('lodash')
const Q = require('q')
const config = require('../../../../common/config')
const { getPortfolioValues, getPeriodsToUpdate } = require('../../../../common/live')
const util = require('util')

const periods = config.periods

const setToFirstRecord = (hook, next) => {
  hook.result = hook.result[0]
  next()
}

const setFirstActivity = async (hook, next) => {
  try {
    let arr = hook.result.isArray() ? hook.result : [hook.result]
    for (let i = 0; i < arr.length; i++) {
      const { _id } = arr[i]

      const transactions = await hook.app.service('transactions').find({
        portfolio: _id,
        $sort: {
          date: 1
        }
      })

      hook.result = await hook.app.service('portfolio').patch(
        _id,
        {
          firstActivity: transactions[0].date
        }
      )
    }
  } catch (e) {
    console.log(e)
  }

  next()
}

const setIndices = async (hook, next) => {
  console.log('FUCKING GO')
  console.log(hook.result)

  try {
    let arr = Array.isArray(hook.result) ? hook.result : [hook.result]
    for (let i = 0; i < arr.length; i++) {
      const { _id, groupBy } = arr[i]

      const holdings = await hook.app.service('holdings').find({
        query: {
          portfolio: arr[i]._id,
          visible: true
        }
      })

      let grouped, groupNameOrder, patches = []

      switch (groupBy) {
        case 'EXCHANGE':
          grouped = _.groupBy(holdings, elem => {
            console.log(elem)
            if (elem.wallet.exchange !== undefined) { return elem.wallet.exchange.name } else { return 'Offline' }
          })

          groupNameOrder = Object.keys(grouped).sort((a, b) => {
            if (a === 'Offline' || a > b) {
              return 1
            }
            if (b === 'Offline' || a < b) {
              return -1
            }
            return 0
          })

          groupNameOrder.forEach((groupName, groupIndex) => {
            grouped[groupName] = grouped[groupName].sort((a, b) => {
              if (a.currency.code > b.currency.code) {
                return 1
              }
              if (a.currency.code < b.currency.code) {
                return -1
              }
              return 0
            })

            grouped[groupName].forEach((elem, index) => {
              patches.push({
                _id: elem._id,
                index: index,
                groupIndex: groupIndex
              })
            })
          })

          break

        case 'TOKEN':
        default:
          grouped = _.groupBy(holdings, elem => {
            return elem.currency.name
          })

          groupNameOrder = Object.keys(grouped).sort()

          groupNameOrder.forEach((groupName, groupIndex) => {
            grouped[groupName] = grouped[groupName].sort((a, b) => {
              const aDisplayName = a.wallet.exchange === undefined ? a.wallet.name : a.wallet.exchange.name
              const bDisplayName = b.wallet.exchange === undefined ? b.wallet.name : b.wallet.exchange.name

              if (aDisplayName > bDisplayName) {
                return 1
              }
              if (aDisplayName < bDisplayName) {
                return -1
              }
              return 0
            })

            grouped[groupName].forEach((elem, index) => {
              patches.push({
                _id: elem._id,
                index: index,
                groupIndex: groupIndex
              })
            })
          })

          break
      }

      console.log(grouped)
      console.log(patches)

      const newHoldings = await Q.allSettled(patches.map(p => {
        const {_id, index, groupIndex} = p
        return hook.app.service('holdings').patch(_id, {index, groupIndex})
      }))

      console.log(newHoldings)

      // arr[i].holdings = newHoldings;
    }

    // hook.result = typeof hook.result === Array ? arr : arr[0];
  } catch (e) {
    console.log(e)
  }

  next()
}

const setValueChange = (hook, next) => {
  console.log('SETVALUECHANGE!')
  console.log(hook)

  if (hook.params && hook.params.before) {
    let diff = 0
    if (hook.params.before.value &&
        hook.params.before.value.current &&
        hook.data.value.current) {
      console.log('OLD VALUE: ' + hook.params.before.value.current)
      console.log('NEW VALUE: ' + hook.data.value.current)
      diff = hook.data.value.current - hook.params.before.value.current
    }

    hook.data.value.diff = diff
  }

  next()
}

const getValues = async (hook, next) => {
  /*
    1H:     30 data pts at 2 minutes
    1D:     48 data pts at 30 minutes
    1W:     42 data pts at 4 hours
    1M:     42 data pts at 16 hours
    3M:     42 data pts at 48 hours
    6M:     42 data pts at 72 hours
    1Y:     42 data pts at 8 days
  */
  try {
    console.log(getPeriodsToUpdate)
    const periodsToUpdate = getPeriodsToUpdate(hook.result)

    if (periodsToUpdate.length > 0) {
      const input = {
        portfolio: hook.result,
        holdings: await hook.app.service('holdings').find({
          portfolio: hook.result._id
        }),
        periods: periodsToUpdate
      }

      const output = await getPortfolioValues(input)
      console.log(util.inspect(output, false, null))
      const {
        portfolio: {_id, value, history},
        holdings
      } = output
      //
      await hook.app.service('portfolio').patch(_id, {value, history})
      //
      holdings.forEach(async (h) => {
        const {_id: hId, value: valueObj} = h
        await hook.app.service('holdings').patch(hId, {value: valueObj})
      })

      // await hook.app.service('holdings').patch(output.holdings);

      // const newPortfolio = await hook.app.service('portfolio').patch(output.portfolio);

      // hook.result = newPortfolio;
    }
  } catch (e) {
    console.log(e)
  }

  next()
}

const shouldUpdate = hook => !hook.params.noUpdates
const groupByHasChanged = () => {
  // console.log(hook)
  return (context) => {
    console.log(context)
    return context.params.before.groupBy !== context.data.groupBy
  }
}
const schema = {
  service: 'portfolio',
  include: [
    {
      service: 'currencies',
      nameAs: 'currency',
      parentField: 'currency',
      childField: '_id',
      query: {
        $select: ['name', 'id', 'code']
      }
    }
  ]
}

module.exports = {
  before: {
    all: [ paramsFromClient('noUpdates') ],
    find: [ /*, populate({schema: schema}) */ ],
    get: [],
    create: [],
    update: [],
    patch: [ stashBefore() ],
    remove: []
  },

  after: {
    all: [],
    find: [
      populate({schema: schema}),
      setToFirstRecord
    ],
    get: [],
    create: [
      setIndices,
      setFirstActivity,
      populate({schema: schema}),
      getValues
    ],
    update: [],
    patch: [
      iff(groupByHasChanged(), setIndices)
    ],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
