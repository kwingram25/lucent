const { paramsForServer, populate } = require('feathers-hooks-common')
const moment = require('moment')
const util = require('util')

const schema = {
  service: 'transactions',
  include: [
    {
      service: 'currencies',
      nameAs: 'currency',
      parentField: 'currency',
      childField: '_id',
      query: {
        $select: ['name', 'id', 'code', 'imageId']
      }
    },
    {
      service: 'exchanges',
      nameAs: 'exchange',
      parentField: 'exchange',
      childField: '_id'
    },

    {
      service: 'wallets',
      nameAs: 'pair.buying.wallet',
      parentField: 'pair.buying.wallet',
      childField: '_id',
      include: [
        {
          service: 'exchanges',
          nameAs: 'exchange',
          parentField: 'exchange',
          childField: '_id'
        }
      ]
    },

    {
      service: 'wallets',
      nameAs: 'pair.selling.wallet',
      parentField: 'pair.selling.wallet',
      childField: '_id',
      include: [
        {
          service: 'exchanges',
          nameAs: 'exchange',
          parentField: 'exchange',
          childField: '_id'
        }
      ]
    },

    {
      service: 'wallets',
      nameAs: 'from',
      parentField: 'from',
      childField: '_id',
      include: [
        {
          service: 'exchanges',
          nameAs: 'exchange',
          parentField: 'exchange',
          childField: '_id'
        }
      ]
    },

    {
      service: 'wallets',
      nameAs: 'to',
      parentField: 'to',
      childField: '_id',
      include: [
        {
          service: 'exchanges',
          nameAs: 'exchange',
          parentField: 'exchange',
          childField: '_id'
        }
      ]
    },
    // },
    {
      service: 'currencies',
      nameAs: 'pair.buying.currency',
      parentField: 'pair.buying.currency',
      childField: '_id',
      query: {
        $select: ['name', 'id', 'code', 'imageId']
      }
    },
    {
      service: 'currencies',
      nameAs: 'pair.selling.currency',
      parentField: 'pair.selling.currency',
      childField: '_id',
      query: {
        $select: ['name', 'id', 'code', 'imageId']
      }
    }
  ]
}

const updateHoldings = async (hook, next) => {
  try {
    // const updatePortfolios = async ( portfolios, transaction ) => {
    //
    //   let portfolio = portfolios[transaction.portfolio];
    //
    //   if (moment(transaction.date).isBefore(moment(portfolio.firstActivity))) {
    //
    //     portfolio = await hook.app.service('portfolio').patch(
    //       portfolio._id,
    //       {
    //         firstActivity: transaction.date
    //       }
    //     );
    //
    //     portfolios[transaction.portfolio].firstActivity = transaction.date;
    //   }
    //   return portfolios;
    // };

    const isNegative = (modifier) => {
      return modifier === 'selling' || modifier === 'from' ? -1 : 1
    }

    const createOrUpdateHolding = async (holdings, transaction, modifier) => {
      let currency, wallet, quantity
      let newHoldings = {}

      console.log('PROCESSING TRANSACTION => HOLDING(S)')
      console.log('TRANSACTION:')
      console.log(transaction)

      switch (transaction.__t) {
        case 'Trade':
          currency = transaction.pair[modifier].currency
          wallet = transaction.pair[modifier].wallet || undefined
          quantity = transaction.pair[modifier].quantity
          break
        case 'Transfer':
          currency = transaction.currency
          wallet = transaction[modifier]
          quantity = transaction.quantity
          break
      }

      console.log('CURRENCY ID: ' + currency)
      console.log('HOLDINGS IN PROGRESS:')
      console.log(util.inspect(holdings, false, null))

      const currencyData = await hook.app.service('currencies').get(currency)

      let existingHolding
      const filtered = holdings[transaction.portfolio].filter(
        h => {
          if (wallet === undefined) {
            return h.currency._id.equals(currency)
          } else {
            return h.currency._id.equals(currency) &&
                   h.wallet._id.equals(wallet)
          }
        }
      )

      console.log(filtered)
      existingHolding = filtered[0]

      const quantityChange = quantity * isNegative(modifier)

      if (existingHolding === undefined) {
        console.log('NO HOLDING, CREATING NEW')
        existingHolding = await hook.app.service('holdings').create({
          portfolio: transaction.portfolio,
          currency: currency,
          wallet: wallet,
          quantity: quantityChange,
          visible: quantityChange > 0 && currencyData.__t !== 'Fiat',
          history: [{
            date: transaction.date,
            diff: quantity,
            transaction: transaction._id
          }]
        })

        console.log('NEW HOLDING:')
        console.log(util.inspect(existingHolding, false, null))

        holdings[transaction.portfolio].push(existingHolding)
      } else {
        console.log('FOUND EXISTING HOLDING')

        console.log('EXISTING QUANTITY: ' + existingHolding.quantity)
        console.log('CHANGE IN QUANTITY: ' + quantity)

        const newQuantity = existingHolding.quantity + quantityChange

        console.log('HOLDING QUANTITY UPDATED, PATCHING')
        existingHolding = await hook.app.service('holdings').patch(
          existingHolding._id,
          {
            quantity: newQuantity,
            visible: newQuantity > 0 && currencyData.__t !== 'Fiat',
            $push: {
              history: {
                date: transaction.date,
                diff: quantityChange,
                transaction: transaction._id
              }
            }
          }
        )

        console.log('MODIFIED HOLDING: ')
        console.log(util.inspect(existingHolding, false, null))

        let otherHoldings = holdings[transaction.portfolio].filter(h => {
          if (h.wallet !== undefined) {
            return !(h.currency._id.equals(currency) &&
                   h.wallet._id.equals(wallet))
          } else {
            return !(h.currency._id.equals(currency))
          }
        })

        console.log('OTHER HOLDINGS BESIDES THIS:')
        console.log(util.inspect(otherHoldings, false, null))

        otherHoldings.push(existingHolding)

        console.log('MERGED HOLDINGS UPDATED:')
        console.log(util.inspect(otherHoldings, false, null))

        holdings[transaction.portfolio] = otherHoldings
      }

      return holdings
    }

    let portfolio, holdings = {}

    for (var i = 0; i < hook.result.length; i++) {
      const transaction = hook.result[i]

      if (holdings[transaction.portfolio] === undefined) {
        // portfolio = await hook.app.service('portfolio').find(
        //   paramsForServer({
        //     query: {_id: transaction.portfolio},
        //     noUpdates: true
        //   })
        // );
        // portfolios[transaction.portfolio] = portfolio;

        const assocHoldings = await hook.app.service('holdings').find({query: {portfolio: transaction.portfolio}})

        console.log(transaction.portfolio)
        console.log(assocHoldings)

        holdings[transaction.portfolio] = assocHoldings
      }

      let existingHolding, increasedHolding, decreasedHolding

      // console.log(portfolio);
      //
      // console.log(portfolio);
      // console.log(holdings);

      let modifiers = []
      switch (transaction.__t) {
        case 'Trade':
          modifiers.push('buying')
          modifiers.push('selling')
          break
        case 'Transfer':
          if (transaction.from !== undefined) { modifiers.push('from') }
          if (transaction.to !== undefined) { modifiers.push('to') }
          break
      }

      console.log(holdings)
      for (let m = 0; m < modifiers.length; m++) {
        // portfolios = await updatePortfolios( portfolios, transaction);
        await createOrUpdateHolding(holdings, transaction, modifiers[m])
      }
    }
  } catch (e) {
    console.log(e)
  }

  next()
  //
  // switch (transaction.__t) {
  //   case 'Transfer':
  //
  //     break;
  //
  //   case 'Trade':
  //
  //     break;
  // }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [ populate({schema}) ],
    get: [ populate({schema}) ],
    create: [ updateHoldings ],
    update: [ updateHoldings ],
    patch: [ updateHoldings ],
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
