const moment = require('moment')

export default function ({period, history, firstActivity, value = {current: 0, histo: 0}}) {
  let now = moment()
  let totalTimespan = moment.duration(now.diff(moment(firstActivity))).asSeconds()

  return [period].filter(h => {
    if (history[h].error === true) {
      return true
    }

    let updateAfter
    switch (h) {
      case 'ALL':
        if (totalTimespan < 3600) {
          updateAfter = moment.duration(2, 'minutes')
        } else if (totalTimespan < 86400) {
          updateAfter = moment.duration(30, 'minutes')
        } else if (totalTimespan < 604800) {
          updateAfter = moment.duration(4, 'hours')
        } else if (totalTimespan < 2419200) {
          updateAfter = moment.duration(16, 'hours')
        } else if (totalTimespan < 4838400) {
          updateAfter = moment.duration(2, 'days')
        } else {
          updateAfter = moment.duration(3, 'days')
        }
        break
      case '1Y':
        if (totalTimespan < moment.duration(1, 'years').asSeconds()) {
          return false
        }
        updateAfter = moment.duration(8, 'days')
        break
      case '6M':
        if (totalTimespan < moment.duration(6, 'months').asSeconds()) {
          return false
        }
        updateAfter = moment.duration(3, 'days')
        break
      case '3M':
        if (totalTimespan < moment.duration(3, 'months').asSeconds()) {
          return false
        }
        updateAfter = moment.duration(2, 'days')
        break
      case '1M':
        if (totalTimespan < moment.duration(1, 'month').asSeconds()) {
          return false
        }
        updateAfter = moment.duration(16, 'hours')
        break
      case '1W':
        if (totalTimespan < moment.duration(1, 'week').asSeconds()) {
          return false
        }
        updateAfter = moment.duration(4, 'hours')
        break
      case '1D':
        if (totalTimespan < moment.duration(1, 'day').asSeconds()) {
          return false
        }
        updateAfter = moment.duration(10, 'minutes')
        break
      case '1H':
        if (totalTimespan < moment.duration(1, 'hour').asSeconds()) {
          return false
        }
        updateAfter = moment.duration(1, 'minutes')
        break
    }

    const {data, updatedAt, error} = history[h]
    const lastUpdate = moment(updatedAt).local()
    //
    // console.log('PERIOD: ' + h)
    // console.log('HAS NO ERRORS: ' + !(error === true))
    // console.log('HAS DATA: ' + !(data === undefined || data.length === 0))
    // console.log('UPDATED AT: ' + lastUpdate.format())
    // console.log('SERVER TIME: '+now.format())
    // //console.log('TYPE OF updatedAt: '+typeof updatedAt)
    // console.log('SHOULD BE UPDATED AFTER: '+updateAfter.asSeconds()+' SECONDS')
    // console.log('TIME SINCE LAST UPDATE: '+moment.duration(now.diff(lastUpdate)).asSeconds()+' SECONDS')
    //

    if (data === undefined || data.length === 0 || moment(updatedAt).isAfter(now)) {
      return true
    }

    console.log(moment.duration(1, 'years').asSeconds())
    console.log(totalTimespan)

    console.log(lastUpdate)

    return moment.duration(now.diff(lastUpdate)).asSeconds() > updateAfter.asSeconds()
  })
}
