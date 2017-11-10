import _ from 'lodash'
import { populate, paramsFromClient, iff, stashBefore } from 'feathers-hooks-common'

const schema = {
  service: 'holdings',
  include: [
    {
      service: 'wallets',
      nameAs: 'wallet',
      parentField: 'wallet',
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
      service: 'currencies',
      nameAs: 'currency',
      parentField: 'currency',
      childField: '_id',
      query: {
        $select: ['name', 'id', 'code', 'imageId']
      }
    }
  ]
}

const setGroupBy = (hook, next) => {
  hook.params.groupBy = hook.params.groupBy ? hook.params.groupBy : 'EXCHANGE'
  next()
}
//
// const addEndpoints = (hook, next) => {
//
//
//   let holdings = hook.result,
//     endpoints = {};
//
//   holdings.forEach(holding => {
//
//     console.log(holding);
//     let endpointSource = holding.wallet.exchange !== undefined ? holding.wallet.exchange.ccName : 'CCAGG';
//
//     endpoints[holding._id] = {
//       _id: holding._id,
//       source: endpointSource,
//       currency: holding.currency.code,
//       quantity: holding.quantity
//     };
//
//   });
//
//   hook.result = {
//     holdings,
//     endpoints
//   };
//   //console.log(hook.result.data);
//   next();
// };

const sortByIndices = (hook, next) => {
  if (hook.result.length > 0) {
    hook.result.forEach((holding, i) => {
      hook.result[i].history = hook.result[i].history.sort(
        (a, b) => {
          if (a.groupIndex < b.groupIndex) {
            return -1
          } else if (a.groupIndex > b.groupIndex) {
            return 1
          } else {
            return a.index - b.index
          }
        }
      )
    })
  }
  next()
}

// const getInitialPrices = (hook, next) => {
//   let holding = hook.data;
//   console.log()
// }

const isShallow = hook => hook.params.shallow

module.exports = {
  before: {
    all: [ paramsFromClient('shallow') ],
    find: [ ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [
      populate({schema}),
      sortByIndices
    ],
    get: [
      populate({schema}),
      sortByIndices
    ],
    create: [
      populate({schema}),
      sortByIndices
    ],
    update: [],
    patch: [
      populate({schema}),
      sortByIndices
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
