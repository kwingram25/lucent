module.exports = {
  getPeriodText (period) {
    const en = (() => {
      switch (period) {
        case 'ALL':
          return 'All'
        case '1Y':
          return '1 Year'
        case '6M':
          return '6 Months'
        case '3M':
          return '3 Months'
        case '1M':
          return '1 Month'
        case '1W':
          return '1 Week'
        case '1D':
          return '1 Day'
        case '1H':
          return '1 Hour'
        default:
          return 'Period'
      }
    })()

    return en
  },

  getPeriodSinceText (period) {
    switch (period) {
      case 'ALL':
        return 'All Time'
      case '1Y':
        return 'In 1 Year'
      case '6M':
        return 'In 6 Months'
      case '3M':
        return 'In 3 Months'
      case '1M':
        return 'Since Last Month'
      case '1W':
        return 'Since Last Week'
      case '1D':
        return 'Since Yesterday'
      case '1H':
        return 'In the Last Hour'
      default:
        return ''
    }
  }
}
