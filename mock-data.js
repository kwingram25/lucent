const feathers = require('feathers/client');
const socketio = require('feathers-socketio/client');
const hooks = require('feathers-hooks');
const errors = require('feathers-errors'); // An object
var mongoose = require('mongoose');
const { tokenPrice } = require('./server/remote/endpoints')();
const io = require('socket.io-client');
const _ = require('underscore');
const Q = require('Q');
const faker = require('faker');
const moment = require('moment');
const fs = require('fs');
const axios = require('axios');
const { promisify } = require('util');

const config = require('./server/config');

let mongoUrl, feathersUrl, dbName;
const mode = process.argv[2];
if (mode === 'prod') {
  mongoUrl = 'mongodb://heroku_pt37gnsm:f25nd30g2ujilvigb4hm88rou8@ds111204.mlab.com:11204/heroku_pt37gnsm';
  feathersUrl = 'https://sleepy-sierra-75938.herokuapp.com/'
} else {
  mongoUrl = 'mongodb://localhost:27017/lucent';
  feathersUrl = 'http://localhost:8000';
}

const currencyDataUrl = 'https://api.coinbase.com/v2/currencies';
const tokenDataUrl = 'https://www.cryptocompare.com/api/data/coinlist/';
const tokenImageUrl = 'https://api.coinmarketcap.com/v1/ticker/';

const feathersClient = feathers()
  .configure(socketio(io(feathersUrl)), {timeout: 10000})
  .configure(hooks());

const portfolios = feathersClient.service('/portfolio');
const holdings = feathersClient.service('/holdings');
const currencies = feathersClient.service('/currencies');
const wallets = feathersClient.service('/wallets');
const exchanges = feathersClient.service('/exchanges');
const transactions = feathersClient.service('/transactions');

const randomDistribution = (total, segments) => {

  const randoms = Array.apply(null, Array(segments)).map(() => Math.random());

  const randomSum = randoms.reduce((sum, value) => sum + parseFloat(value), 0);

  return randoms.map(r => parseFloat(((r / randomSum) * total).toFixed(8)));
}

const exchangeJson = [{
  id: 'coinbase',
  name: 'Coinbase',
  ccName: 'Coinbase',
  url: 'http://www.coinbase.com'
}, {
  id: 'bittrex',
  name: 'Bittrex',
  ccName: 'Bittrex',
  url: 'http://www.bittrex.com'
}];

const periods = config.periods;
const altcoins = ['ETH', 'STRAT', 'BAT', 'LTC', 'CFI', 'ANT', 'WAVES'];
const baseCurrencies = ['USD', 'GBP', 'EUR', 'BTC']
const exchangeIds = ['bittrex'];
const numberOfDates = 1 + exchangeIds.length + (1 + exchangeIds.length * altcoins.length * 2);
const dayIncrement = 14;

const fiat = 'USD';
const btc_max = 20;
const btc_initialQty = parseFloat(faker.finance.amount(0, btc_max, 8));
const btc_distribution = randomDistribution(btc_initialQty, (1 + altcoins.length * exchangeIds.length));

//console.log(btc_distribution);

const nowDate = moment();

const randomDate = function* (numberOfDates) {

  let startDate = moment().subtract(numberOfDates*dayIncrement, 'days');
  let endDate = moment().subtract((numberOfDates-1) * dayIncrement, 'days');
  let dates = [];

  for (let i = 0; i < numberOfDates; i++) {
    dates[i] = moment(faker.date.between(startDate.format(), endDate.format()));
    startDate = startDate.add(dayIncrement, 'days');
    endDate = endDate.add(dayIncrement, 'days');
  }

  //console.log(dates);

  yield* dates;
}(numberOfDates);



(async () => {

  /* Connect to the DB */
  try {


    await mongoose.connect(mongoUrl);

    mongoose.connection.db.dropDatabase();

    const tokenImagesData = await axios.get(tokenImageUrl);
    //console.log(tokenImagesData);

    const imageIds = _.groupBy(tokenImagesData.data.map(({id, symbol, rank}) => ({id, symbol, rank})).sort((t1, t2) => parseInt(t1.rank, 10) - parseInt(t2.rank, 10)), 'symbol');

    //console.log(imageIds);

    const tokenData = await axios.get(tokenDataUrl);

    //console.log(tokenData);


    const mockTokens = await currencies.create(Object.values(tokenData.data.Data)
      .map(({Name, CoinName}) => ({
          __t: 'Token',
          id: Name.toLowerCase(),
          name: CoinName,
          code: Name,
          imageId: imageIds[Name] !== undefined ? imageIds[Name][0].id : null,
          isBase: baseCurrencies.includes(Name)
        }))
    );

    const existsAlready = _.indexBy(mockTokens, 'code');

    const currencyData = await axios.get(currencyDataUrl);
    const mockFiats = await currencies.create(currencyData.data.data
      .filter(currency => existsAlready[currency.id] === undefined)
      .map(({name, id}) => {
        return Object.assign({name, id}, {
          __t: 'Fiat',
          id: id.toLowerCase(),
          code: id,
          isBase: baseCurrencies.includes(id)
        });
      })
    );


    const mockCurrencies = await currencies.find({
      query: {
        code: {
          $in: [fiat, 'BTC', ...altcoins]
        }
      }
    }).then(res => _.indexBy(res, 'code'));

    const btc_id = mockCurrencies.BTC._id;
    const fiat_id = mockCurrencies[fiat]._id;

    const port_id = mongoose.Types.ObjectId();

    const mockExchanges = await exchanges.create(exchangeJson)
        .then(res => _.indexBy(res, 'id'));

    const coinbase_ref = mockExchanges.coinbase._id;

    //console.log(mockExchanges);

    const mockWallets = _.groupBy(await wallets.create([
        {
          exchange: mockExchanges.coinbase._id,
        },
        ...([].concat.apply([], ['BTC', ...altcoins].map(() =>
            exchangeIds.map((eId) => ({
              exchange: mockExchanges[eId]._id
            }))
          )))
      ].map((mw) => Object.assign(mw, {__t: "Exchange"}))),
    "exchange");

    //console.log(mockWallets);

    const btc_coinbase = mockWallets[coinbase_ref][0]._id;


    //
    // const [
    //   btc_coinbase, eth_coinbase, ltc_coinbase,
    //   btc_bittrex, eth_bittrex, ltc_bittrex, strat_bittrex, bat_bittrex, cfi_bittrex
    // ] = await wallets.create(mockWallets);
    //
    //

    //console.log(tokenPrice);

    const initialDate = randomDate.next().value;
    const btc_initialRate = await tokenPrice.get({
      token: 'BTC',
      base: fiat,
      to: initialDate
    });

    const initialBTCPurchase = {
      __t: 'Trade',
      portfolio: port_id,
      type: 'BUY',
      date: initialDate,
      exchange: mockExchanges.coinbase._id,
      pair: {
        buying: {
          currency: btc_id,
          wallet: btc_coinbase,
          quantity: btc_initialQty
        },
        selling: {
          currency: fiat_id,
          quantity: btc_initialQty * btc_initialRate
        }
      },
      rate: btc_initialRate,
      fee: 0
    };


    const transferBTCToExchanges = Object.keys(mockExchanges).slice(1).map((eId, exIndex) => {
      //const distIndex = 1 + (altcoins.length * exIndex) + altIndex;
      //console.log(mockWallets);
      return {
        __t: 'Transfer',
        portfolio: port_id,
        date: randomDate.next().value,
        currency: btc_id,
        quantity: btc_distribution.slice(1).reduce((s, v) => s + parseFloat(v), 0),
        from: btc_coinbase,
        to: mockWallets[mockExchanges[eId]._id][0],
        fee: 0
      };
    });

    const btc_sellForFiatDate = randomDate.next().value;
    const btc_sellRate = await tokenPrice.get({
      token: 'BTC',
      base: fiat,
      to: btc_sellForFiatDate
    });

    const btc_sellQty = btc_distribution[0];

    const sellBTCForFiat = {
      __t: 'Trade',
      portfolio: port_id,
      type: 'SELL',
      date: btc_sellForFiatDate,
      exchange: mockExchanges.coinbase._id,
      pair: {
        buying: {
          currency: fiat_id,
          quantity: btc_sellQty * btc_sellRate
        },
        selling: {
          currency: btc_id,
          wallet: btc_coinbase,
          quantity: btc_sellQty
        }
      },
      rate: btc_sellRate,
      fee: 0
    };
    //
    //

    let altcoinPrices = {};
    for (let code of altcoins) {

        const alt_buyDate = randomDate.next().value;
        const alt_sellDate = randomDate.next().value;

        altcoinPrices[code] = {
          buy: {
            date: alt_buyDate,
            price: await tokenPrice.get({
              token: code,
              base: 'BTC',
              to: alt_buyDate
            })
          },
          sell: {
            date: alt_sellDate,
            price: await tokenPrice.get({
              token: code,
              base: 'BTC',
              to: alt_sellDate
            })
          }
        };

    }

  //
  //   const altcoinPrices = (async() => _.indexBy('code', altcoins.map((code, index) => {
  //
  //     const buyDate = nextRandomDate();
  //     const buyPrice = await tokenPrice.get(code, 'BTC', 'ALL', lastRandomDate);
  //     const sellDate = nextRandomDate();
  //     const sellPrice = await tokenPrice.get(code, 'BTC', 'ALL', lastRandomDate);
  //
  //
  //     return {
  //       code,
  //       buy: {
  //         date: buyDate,
  //         price: buyPrice
  //       },
  //       sell: {
  //         date: sellDate,
  //         price: sellPrice
  //       }
  //     };
  //   })
  // ) ) ();

    const randomBuysAndSells = [].concat.apply([], altcoins.map((code, altIndex) =>
      Object.keys(mockWallets).slice(1).map((eId, exIndex) => {
          const distIndex = 1 + (altcoins.length * exIndex) + altIndex;
          const btc_spentOnAltcoin = btc_distribution[ distIndex ];
          const btc_boughtBack = parseFloat(faker.finance.amount(0, btc_spentOnAltcoin, 8));

          const { buy, sell } = altcoinPrices[code];

          const alt_buyDate = buy.date;
          const alt_sellDate = sell.date;
          const alt_firstRate = parseFloat(buy.price);
          const alt_secondRate = parseFloat(sell.price);

          //console.log(alt_firstRate);
          //console.log(alt_secondRate);

          //console.log(mockWallets[eId][1+altIndex]);

          return [{
            __t: 'Trade',
            portfolio: port_id,
            type: 'BUY',
            date: alt_buyDate,
            exchange: eId,
            pair: {
              buying: {
                currency: mockCurrencies[code]._id,
                wallet: mockWallets[eId][1 + altIndex]._id,
                quantity: parseFloat((btc_spentOnAltcoin / alt_firstRate).toFixed(8))
              },
              selling: {
                currency: btc_id,
                wallet: mockWallets[eId][0]._id,
                quantity: btc_spentOnAltcoin
              }
            },
            rate: alt_firstRate,
            fee: 0
          }, {
            __t: 'Trade',
            portfolio: port_id,
            type: 'SELL',
            date: alt_sellDate,
            exchange: eId,
            pair: {
              selling: {
                currency: mockCurrencies[code]._id,
                wallet: mockWallets[eId][1 + altIndex]._id,
                quantity: parseFloat((btc_boughtBack / alt_secondRate).toFixed(8))
              },
              buying: {
                currency: btc_id,
                wallet: mockWallets[eId][0]._id,
                quantity: btc_boughtBack
              }
            },
            rate: alt_secondRate,
            fee: 0
          }];
        })
      ));

      const mockTransactions = [
        initialBTCPurchase,
        sellBTCForFiat,
        ...transferBTCToExchanges,
        ...randomBuysAndSells.reduce((a, v) => a.concat(...v))
      ];

      //console.log(mockTransactions);

      await transactions.create(mockTransactions);

      // const writeFile = promisify(fs.writeFile);
      // var filename = './my.txt';
      // var str = JSON.stringify(transfers, null, 4);
      //
      // await writeFile(filename, str, function(err){
      //     if(err) {
      //         console.log(err)
      //     } else {
      //         console.log('File written!');
      //     }
      // });

    //
    // console.log([
    //   initialBTCPurchase,
    //   ...transferBTCToExchanges,
    //   sellBTCForFiat,
    //   ...randomBuysAndSells
    // ]);

    await portfolios.create({
      _id: port_id,
      demo: true,
      period: '1H',
      currency: fiat_id,
      groupBy: 'TOKEN'
    });


  } catch(e) {
    console.log(e);
  }

  process.exit();
})();

//
// const portfolio = {
//   demo: true,
//   period: '1D',
//   value: {
//     current: 0,
//     histo: 0
//   },
//   groupBy: 'TOKEN'
// };
//
