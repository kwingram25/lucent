const moment = require('moment')
const url = require('url')
const path = require('path')
const axios = require('axios')

module.exports = function () {
  const urls = {
    coinbase: 'http://api.coinbase.com/v2',
    bittrex: 'www.bittrex.com/api/v1.1/public',
    coinmarketcap: 'https://api.coinmarketcap.com/v1',
    cryptocompare: 'https://min-api.cryptocompare.com/data'
  }

  /* coinbase: {
      tokenPrice: {
        url: ({token, base}) => `${urls.coinbase}/prices/${token}-${base}/spot`,
        callback: (res) => res.data.amount
      },
      markets: {
        url: () => `${this.baseUrl}/exchange-rates?currency=`,
      }
    },

    bittrex: {
      tokenPrice: {
        url: ({token, base}) => `${urls.bittrex}/getticker?market=${base}-${token}`,
        callback: (res) => res.result.Last
      },
      markets: {
        url: () => `${this.baseUrl}/getcurrencies`,
        callback: (req, res) => res.result.map(m => m.MarketName)
      }
    },

    coinmarketcap: {
      tokenPrice: {
        url: ({token, base}) => `${urls.coinmarketcap}/ticker/?convert=${base}`,
        callback: (req, res) => {
          _.groupBy(res, t => t.symbol)[req.token][`price_${req.params.convert.toLowerCase()}`];
        }
      }
    },

    cryptocompare: {

      hasMulti: true, */

  const Markets = function () {
    this.url = ({exchange}) => {
      let host = urls[exchange],
        pathname,
        protocol = 'https',
        query

      switch (exchange) {
        case 'bittrex':
          pathname = 'getmarkets'
          query = {}
          break
        default:
          break
      }

      return url.format({
        host,
        pathname,
        protocol,
        query
      })
    }

    this.callback = (req, {exchange}) => {
      console.log(req.data.result[0])
      switch (exchange) {
        case 'bittrex':
          return req.data.result.filter(d => d.IsActive === true)
            .map(({MarketCurrency, BaseCurrency}) => ({
              token: MarketCurrency,
              base: BaseCurrency
            }))
        default:
          return []
      }
    }

    this.get = async (options) => {
      const {exchange, base} = options
      console.log(options)
      if (exchange === 'coinbase') {
        const accepted = ['USD', 'EUR', 'AUD', 'CAD']
        return Promise.resolve(
          accepted.includes(base)
            ? ['BTC', 'ETH', 'LTC'].map(t => ({
              token: t,
              base
            }))
            : []
        )
      }

      const url = this.url(options)

      console.log(url)

      /// / console.log(url);
      const res = await axios.get(url)
      return this.callback(res, options)
    }
  }

  const TokenPrice = function () {
    this.url = ({token, base, period = 'NOW', multi = false, from = moment(), to = moment(), exchange = 'CCCAGG'}) => {
      let host = urls.cryptocompare,
        pathname,
        query = {
          fsym: token,
          tsym: base,
          tsyms: base,
          e: exchange !== 'CCCAGG' ? exchange : 'CCCAGG'
        }

      const diff = moment.duration(from.diff(to)).asSeconds()

      // // console.log(diff);
      // // console.log(period);
      switch (period) {
        case 'ALL':

          console.log('DIFF IS: ' + diff)
          const increment = Math.abs(Math.floor(diff / 48))
          console.log('INCREMENT IS: ' + increment)
          query.limit = 48

          if (diff < 172800) {
            pathname = '/histominute'
            query.aggregate = Math.max(1, Math.ceil(increment / 60))
          } else if (diff < 4147200) {
            pathname = '/histohour'
            query.aggregate = Math.max(1, Math.ceil(increment / 3600))
          } else {
            pathname = '/histoday'
            query.aggregate = Math.max(1, Math.ceil(increment / 86400))
          }

          break
        case '1Y':
          if (multi) {
            /// / // console.log('1Y multi');
            pathname = '/histoday'
            delete query.tsyms
            query.limit = 42
            query.aggregate = 8
          } else {
            /// / // console.log('1Y single');
            pathname = '/pricehistorical'
            query.ts = to.subtract(6, 'months').unix()
          }
          break
        case '6M':
          if (multi) {
            // // console.log('6M multi');

            pathname = '/histoday'
            delete query.tsyms
            query.limit = 60
            query.aggregate = 3
          } else {
            // // console.log('6M single');

            pathname = '/pricehistorical'
            query.ts = to.subtract(6, 'months').unix()
          }
          break
        case '3M':
          if (multi) {
            // // console.log('3M multi');
            pathname = '/histoday'
            delete query.tsyms
            query.limit = 45
            query.aggregate = 2
          } else {
            // // console.log('3M single');
            pathname = '/pricehistorical'
            query.ts = to.subtract(3, 'months').unix()
          }
          break
        case '1M':
          if (multi) {
            // // console.log('1M multi');

            pathname = '/histohour'
            delete query.tsyms
            query.limit = 42
            query.aggregate = 16
          } else {
            // // console.log('1M single');

            pathname = '/pricehistorical'
            query.ts = to.subtract(1, 'month').unix()
          }
          break
        case '1W':
          if (multi) {
            // // console.log('1W multi');

            pathname = '/histohour'
            delete query.tsyms
            // query.toTs = to.subtract(1, 'week').unix();
            query.limit = 56
            query.aggregate = 3
          } else {
            // // console.log('1W single');

            pathname = '/pricehistorical'
            query.ts = to.subtract(1, 'week').unix()
          }
          break
        case '1D':
          if (multi) {
            // // console.log('1D multi');

            pathname = '/histominute'
            delete query.tsyms
            query.limit = 144
            query.aggregate = 10
          } else {
            // // console.log('1D single');

            pathname = '/histohour'
            query.limit = 24
            delete query.tsyms
          }
          break
        case '1H':
          // // console.log('1H');

          pathname = '/histominute'
          query.limit = 60
          if (multi) {
            query.aggregate = 1
          }
          break
        case 'NOW':
        default:

          if (diff > 0) {
            // // console.log('single price from past');
            pathname = '/pricehistorical'
            query.ts = from.unix()
          } else {
            // // console.log('single price right now');
            pathname = `/price`
            delete query.tsym
            query.tsyms = base
            break
          }
      }
      // // console.log(query);
      return url.format({
        host,
        pathname,
        query
      })
    }

    this.callback = (req, {period, multi = false}) => {
      let res

      const {pathname, query: {tsym, tsyms, fsym, fsyms, e, ts, limit}} = url.parse(req.request.path, true)
      const data = req.data

      switch (path.parse(pathname).name) {
        case 'pricehistorical':
          res = data[fsym][tsym]
          break
        case 'histohour':
        case 'histominute':
        case 'histoday':
          if (multi) {
            res = data.Data.map(d => ({
              date: d.time,
              value: parseFloat(((d.low + d.high) / 2).toFixed(8), 10)
            }))

            if (period === 'ALL') {
              console.log('GOT ' + res.length + ' DATA POINTS')
            }
          } else {
            let low = data.Data[0].low
            let high = data.Data[0].high
            res = parseFloat(((low + high) / 2).toFixed(8), 10)
          }
          break
        case 'price':
        default:
          res = data[tsyms]
      }
      /// / // console.log(res);
      return res || 0
    }

    this.get = async (options) => {
      const url = this.url(options)

      console.log(url)

      /// / console.log(url);
      const res = await axios.get(url)
      return this.callback(res, options)
    }

    return this
  }

  return {
    tokenPrice: new TokenPrice(),
    markets: new Markets()
  }
}
