import mongoose from 'mongoose'
import axios from 'axios'
import _ from 'lodash'
const currencyDataUrl = 'https://api.coinbase.com/v2/currencies'
const tokenDataUrl = 'https://www.cryptocompare.com/api/data/coinlist/'
const tokenImageUrl = 'https://api.coinmarketcap.com/v1/ticker/'

const baseCurrencies = ['USD', 'GBP', 'EUR', 'BTC']

const syncCurrencies = async function () {
  const app = this
  // await mongoose.connect(mongoUrl)
  console.log(app)
  // mongoose.connection.db.dropDatabase()

  const tokenImagesData = await axios.get(tokenImageUrl)
  // console.log(tokenImagesData)

  const imageIds = _.groupBy(tokenImagesData.data.map(({id, symbol, rank}) => ({id, symbol, rank})).sort((t1, t2) => parseInt(t1.rank, 10) - parseInt(t2.rank, 10)), 'symbol')

  // console.log(imageIds)

  const tokenData = await axios.get(tokenDataUrl)

  // console.log(tokenData)

  const existingTokens = Object.keys(_.keyBy(await app.service('currencies').find({query: {__t: 'Token'}}), 'code'))

  // console.log(existingTokens)

  await app.service('currencies').create(Object.values(tokenData.data.Data)
    .filter(({Name}) => !(existingTokens.includes(Name)))
    .map(({Name, CoinName}) => {
      console.log(Name)
      return {
        __t: 'Token',
        id: Name.toLowerCase(),
        name: CoinName,
        code: Name,
        imageId: imageIds[Name] !== undefined ? imageIds[Name][0].id : null,
        isBase: baseCurrencies.includes(Name)
      }
    })
  )

  const existingCurrencies = Object.keys(_.keyBy(await app.service('currencies').find({query: {__t: 'Fiat'}}), 'code'))

  const currencyData = await axios.get(currencyDataUrl)
  const newCurrencies = await app.service('currencies').create(currencyData.data.data
    .filter(currency => !(existingCurrencies.includes()))
    .map(({name, id}) => {
      return Object.assign({name, id}, {
        __t: 'Fiat',
        id: id.toLowerCase(),
        code: id,
        isBase: baseCurrencies.includes(id)
      })
    })
  )

  console.log('New Currencies:')
  console.log(newCurrencies.map(({code}) => code))
}

module.exports = {
  syncCurrencies
}
