const { tokenPrice } = require('../../server/remote/endpoints')()
const moment = require('moment')
const _ = require('lodash')
const Q = require('q')
const util = require('util')

export default async function ({portfolio, holdings, periods}) {
  try {
    // console.log(holdings);
    const {_id, currency: { code: base }, period, value, firstActivity} = portfolio

    const val = value || {
      current: 0,
      histo: 0
    }

    let output = {
      portfolio: {
        _id,
        value: val
      }
    }

    if (periods.length > 0) {
      output.portfolio.history = {}
    }

    // console.log('firstActivity: '+firstActivity)

    const allHistory = holdings.reduce((prev, curr) => prev.concat(curr.history), [])

    output.portfolio.firstActivity = moment.min(
      moment(firstActivity),
      allHistory.reduce((prev, curr) => moment(curr.date).isBefore(prev) ? moment(curr.date) : prev, moment(firstActivity))
    )

    // console.log('corrected to: '+output.portfolio.firstActivity);

    const now = moment()

    // console.log('fuckass');
    // console.log(holdings);
    // console.log(periods);

    let runningTotals = {},
      requestsCurrent = {},
      requestsHistory = {},
      tokens = [],
      fiats = []
    // Get current values

    let holdingsHistory = {},
      holdingsObj = _.groupBy(holdings, h => {
        return h.currency.code
      })

    for (let i = 0; i < holdings.length; i++) {
      const { currency: { code }, history, quantity } = holdings[i]

      history.forEach(entry => {
        if (holdingsHistory[code] === undefined) {
          holdingsHistory[code] = []
        }
        holdingsHistory[code].push(entry)
      })

      if (!tokens.includes(code) && code !== base) {
        tokens.push(code)

        requestsCurrent[code] = {
          token: code,
          base
        }

        for (let p = 0; p < periods.length; p++) {
          const per = periods[p]
          let req = {
            token: code,
            base,
            multi: true,
            period: per,
            to: moment(firstActivity)
          }

          requestsHistory[per] = Object.assign(requestsHistory[per] || {}, {
            [code]: req
          })
        }
      }
    }

    // console.log(requestsCurrent);

    const results = await Q.allSettled([
      ...periods.map(p =>
        Q.allSettled(
          tokens.map(t =>
            tokenPrice.get(requestsHistory[p][t])
          )
        )
      ),
      Q.allSettled(
        tokens.map(t =>
          tokenPrice.get(requestsCurrent[t])
        )
      )
    ])

    const newNow = moment()

    let priceCurrent = results.pop().value.map(r => r.value)
    let priceHistory = results.map(res => res.value.map(r => r.value))
    // console.log(util.inspect(priceCurrent, false, null))
    /// / console.log(priceHistory);

    // console.log(priceCurrent);
    // Current values
    tokens.forEach((code, ti) => {
      holdingsObj[code].forEach((h, hi) => {
        let v
        if (code === base) {
          v = {
            perUnit: 1,
            total: h.quantity
          }
        } else {
          v = {
            perUnit: priceCurrent[ti],
            total: priceCurrent[ti] * h.quantity
          }
        }

        holdingsObj[code][hi].value.current = v
      })
    })

    // console.log(util.inspect(holdingsObj, false, null));

    const newValue = Object.values(holdingsObj)
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(h => h.visible && h.currency.code !== base)
      .reduce((prev, curr) => prev + curr.value.current.total, 0)

    const newDiff = newValue - val.current

    Object.assign(output.portfolio.value, {
      current: newValue,
      diff: newDiff
    })

    periods.forEach((p, pi) => {
      // TODO incoroprate hidden fiat holding & include in portfol value

      /// / console.log(priceHistory[pi])
      const timestamps = priceHistory[pi][0].map(({date}) => date)

      let error = false
      priceHistory[pi].forEach(th => {
        if (th.length === 0) {
          error = true
        }
      })

      output.portfolio.history[p] = {
        updatedAt: newNow,
        error,
        data: timestamps.map((ts, tsi) => {
          if (p === period && tsi === 0) {
            output.portfolio.value.histo = tokens.reduce((prev, curr, ti) => {
              holdingsObj[curr].forEach((h, hi) => {
                holdingsObj[curr][hi].value.histo = {
                  perUnit: priceHistory[pi][ti][tsi]
                    ? priceHistory[pi][ti][tsi].value
                    : holdingsObj[curr][hi].value.histo
                      ? holdingsObj[curr][hi].value.histo
                      : 0
                }
              })

              // console.log(curr+' HISTORY:');
              /// / console.log(util.inspect(holdingsHistory[curr], false, null));

              const qtyThen = holdingsHistory[curr]
                .filter(entry => moment(entry.date).isBefore(moment.unix(ts)))
                .reduce((q, entry) => q + entry.diff, 0)

              const priceThen = priceHistory[pi][ti][tsi]
                ? priceHistory[pi][ti][tsi].value
                : holdingsObj[curr][0].value.histo
                  ? holdingsObj[curr][0].value.histo
                  : 0

              // console.log("QTYTHEN: "+qtyThen);
              // console.log("PRICETHEN: "+priceThen);

              return prev + (qtyThen * priceThen)
            }, 0)
          }

          return {
            date: moment.unix(ts),
            value: tokens.reduce((prev, curr, ti) => {
              /// / console.log(util.inspect(results[pi].value[ti], false, null));
              /// / console.log(curr+' HISTORY: '+priceHistory[pi][ti].length+' POINTS');
              /// / console.log(util.inspect(priceHistory[pi][ti], false, null));

              const qtyThen = holdingsHistory[curr]
                .filter(entry => moment(entry.date).isBefore(moment.unix(ts)))
                .reduce((q, entry) => q + entry.diff, 0)
              // // console.log({
              //   p,
              //   pi,
              //   curr,
              //   ti,
              //   ts,
              //   tsi
              // })
              // // console.log(util.inspect(priceHistory[pi][ti]));

              const priceThen = priceHistory[pi][ti][tsi]
                ? priceHistory[pi][ti][tsi].value
                : holdingsObj[curr][0].value.current.perUnit
                  ? holdingsObj[curr][0].value.current.perUnit
                  : 0

              // // console.log("QTYTHEN: "+qtyThen);
              // // console.log("PRICETHEN: "+priceThen);

              return prev + (qtyThen * priceThen)
            }, 0)
          }
        })
      }
      //
    })

    if (output.portfolio.history && output.portfolio.history.ALL) {
      output.portfolio.history.ALL.data = output.portfolio.history.ALL.data.filter(d => d.value > 0)
    }

    // if (priceHistory.timestamps === undefined) {
    //   priceHistory.timestamps = tokenPriceHistory.map(({time}) => time);
    // }
    //
    // priceHistory[p][token] = tokenPriceHistory;
    //
    // if (p === period) {
    //   const perUnit = priceHistory[p][token][0];
    //   holdings[i].value.histo = {
    //     perUnit: priceHistory[p][token][0]
    //   }
    // }
    //
    //
    // portfolio.value.current = holdings.reduce((sum, holding) => sum + holding.value.current.total, 0),

    // holdingHistory.sort((a, b) => moment(a.date).isBefore(moment(b.date)));
    //
    //
    // periods.forEach(p => {
    //   portfolio.history[p] = {
    //     updatedAt: moment(),
    //     data: priceHistory.timestamps.map((ts, i) => ({
    //       date: moment(ts),
    //       value: holdings.reduce((sum, holding) => {
    //
    //           const { token } = holding.currency.code;
    //           //quantity held at ts * price at ts
    //           const qtyThen = holdingHistory
    //                         .filter(entry => moment(entry.date).isBefore(moment(ts)))
    //                         .reduce((q, entry) => q + entry.quantity, 0);
    //
    //           const priceThen = priceHistory[p][token][i];
    //
    //           return sum + (qtyThen * priceThen);
    //
    //         }, 0)
    //
    //     }))
    //   }

    output.holdings = Object.values(holdingsObj).reduce((prev, curr) => prev.concat(curr), []).map(({_id, value}) => ({_id, value}))

    return output
  } catch (e) {
    // console.log(e);
  }

  //
  // holdings[i].value = {
  //   current: {
  //     perUnit: currentPrice,
  //     total: currentPrice * quantity
  //   }
  // };
};
