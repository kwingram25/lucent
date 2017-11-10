import socketio from 'feathers-socketio'
import util from 'util'
import _ from 'lodash'

import getPortfolioValues from '../../../common/live/getPortfolioValues'
import getPeriodsToUpdate from '../../../common/live/getPeriodsToUpdate'
import getExchangeMarkets from '../../../common/live/getExchangeMarkets'

module.exports = function () {
  const app = this
  app.configure(socketio(io => {
    io.on('connection', (socket) => {
      console.log('Connected to live updates')

      socket.on('getMarkets', async (data) => {
        console.log('getMarkets ' + data)
        const marketCodes = await getExchangeMarkets(data)

        const currencies = _.keyBy(await app.service('currencies').find({
          query: {
            code: {
              $in: [
                ...marketCodes.map(({token}) => token),
                ...[...new Set(marketCodes.map(({base}) => base))]
              ]
            }
          }
        }), 'code')

        // console.log(currencies)

        const markets = marketCodes
          .filter(({token}) => currencies[token] !== undefined)
          .map(({token, base}) => {
            // console.log(token)
            // console.log(currencies[token])
            // console.log(currencies[base])
            return {
              symbol: `${token}-${base}`,
              base: {
                _id: currencies[base]._id,
                code: base
              },
              token: {
                _id: currencies[token]._id,
                imageId: currencies[token].imageId,
                name: currencies[token].name,
                code: token
              }
            }
          })
        // console.log(markets)
        socket.emit('exchangeMarkets', markets)
      })

      socket.on('update', async (data) => {
        console.log('received update req')

        const { portfolio, holdings } = data
        const periods = getPeriodsToUpdate(portfolio) || []

        console.log(periods)

        for (let i = 0; i < holdings.length; i++) {
          if (typeof holdings[i].currency !== 'object') {
            holdings[i].currency = await app.service('currencies').get(holdings[i].currency)
          }
        }

        getPortfolioValues({portfolio, holdings, periods}).then(res => {
          const {
            portfolio: {
              _id,
              value: newValue,
              history: newHistory
            },
            holdings
          } = res

          console.log(util.inspect(res, false, null))

          app.service('portfolio').patch(
            _id,
            {
              value: newValue || portfolio.value,
              history: Object.assign(portfolio.history || {}, newHistory || {})
            }
          )

          holdings.forEach((h) => {
            const {_id: hId, value: valueObj} = h
            app.service('holdings').patch(hId, {value: valueObj})
          })

          // Object.keys(portfolio).forEach(_id => { app.service('portfolio').patch(_id, portfolio[_id]); });
          //
          // app.service('holdings').patch({
          //   type: 'parallel',
          //   call: Object.keys(holdings).map(hld => ['holdings::patch', hld, holdings[hld]])
          // });
        })
      })
    })
  }), {
    timeout: 10000
  })
}
