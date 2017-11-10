import React, {Component} from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis } from 'recharts'

class PortfolioGraph extends Component {
  state = {
    data: this.props.data || [],
    period: this.props.period || '1D',
    animate: true
  }

  constructor (props) {
    super(props)
    this.setState(Object.assign(this.state || {}, props))

    this.animationDuration = 1500
  }

  componentDidMount () {
    // setTimeout(() => {
    //   this.setState({animate: false})
    // }, this.animationDuration + 200)
  }

  // componentShouldUpdate (nextProps, nextState) {
  //   console.log('fuckoff')
  //   console.log(Object.keys(nextProps).filter(p => nextProps[p] !== this.props[p]))
  //   if (this.state.animate === nextState.animate) {
  //     return false
  //   }
  //   return true
  // }

  componentDidUpdate () {
    // setTimeout(() => {
    //   this.setState({animate: false})
    // }, this.animationDuration + 100)
  }

  componentWillReceiveProps (nextProps) {
    console.log('graph receive props')
    // this.setState({animate: true, data: null})
    // this.setState({data: nextProps.data})

    this.setState(Object.assign(this.state, nextProps))
  }

  round (value, to, fn = Math.floor, context = Math) {
    return fn.call(context, value / to) * to
  }

  nearests = () => {
    return function * () {
      yield * [
        1, 2, 4, 5, 10, 20, 25, 50
      ]
    }
  }

  increments = () => {
    return function * () {
      yield * [
        10, 20, 40, 60,
        100, 200, 300, 400, 500, 600, 800,
        1000, 1200, 1500, 2000, 4000, 5000,
        10000, 15000, 20000, 40000, 50000, 100000
      ]
    }
  }

  getIncrement = (spread) => {
    let res = 0

    const increments = this.increments()()
    while (spread * 1.05 > 4 * res) {
      res = increments.next().value
    }

    console.log('rounding to ' + res)
    console.log('spread is ' + spread)
    return res
  }

  getRoundTo = (min, max, increment) => {
    const { round } = this,
      nearest = this.nearests()()
    let res = 1

    while (round(min, increment / res) + (4 * increment) < max) {
      console.log(round(min, increment / res) + (4 * increment) - max)
      res = nearest.next().value
      console.log(res)
    }
    console.log(res)
    return res
  }

  drawArea = () => {
    const {period} = this.state
  }

  getDiff = (data) => {
    const earliest = moment(data[0].date)
    const latest = moment(data[data.length - 1].date)
    return moment.duration(latest.diff(earliest)).asSeconds()
  }

  getDateFormatter = () => {
    const { getDiff } = this
    const { data, period } = this.state

    return (date) => {
      let format
      switch (period) {
        case 'ALL':
          const totalSeconds = getDiff(data)
          if (totalSeconds > 86400) {
            format = 'MMM D'
          } else {
            format = 'hh:mm A'
          }
          break
        case '1Y':
        case '6M':
        case '3M':
        case '1M':
        case '3W':
        case '1W':
          format = 'MMM D'
          break
        case '1D':
        default:
          format = 'hh:mm A'
          break
      }
      return moment(date).format(format)
    }
  }

  getXAxisInterval = () => {
    const { period, data } = this.state
    switch (period) {
      case 'ALL':
        return Math.floor(data.length / 4)
      case '1Y':
      case '6M':
        return 14
      case '3M':
        return 8
      case '1M':
        return 8
      case '1W':
        return 7
      case '1D':
        return 35
      case '1H':
      default:
        return 14
    }
  }

  getChart = () => {
    const {
      getIncrement,
      getRoundTo,
      round,
      getDateFormatter,
      getXAxisInterval,
      drawArea
    } = this
    const {data, period} = this.state

    const dataMin = Math.min(...data.map(({value}) => value)),
      dataMax = Math.max(...data.map(({value}) => value)),
      spread = dataMax - dataMin,

      increment = getIncrement(spread),
      roundTo = getRoundTo(dataMin, dataMax, increment),

      yMin = round(dataMin, increment / roundTo),
      yMax = yMin + (4 * increment)

    console.log({
      dataMin, dataMax, spread, increment, roundTo, yMin, yMax
    })

    return (
      <AreaChart key={Math.random()} data={data}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#418fcb" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#418fcb" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area
          isAnimationActive={this.state.animate}
          animationDuration={this.animationDuration}
          type={period === '1H' ? 'stepBefore' : 'monotone'}
          dataKey="value"
          stroke="#1967a2"
          strokeWidth="2"
          fillOpacity={1}
          fill="url(#colorUv)" />
        <XAxis
          type="category"
          dataKey="date"
          interval={getXAxisInterval()}
          tickFormatter={getDateFormatter()}
          stroke="#999" />
        <YAxis
          type="number"
          interval="preserveStartEnd"
          padding={{bottom: 10}}
          tickCount={5}
          tickFormatter={v => v.toLocaleString(undefined, {maximumFractionDigits: 0})}
          domain={[yMin, yMax]}
          stroke="#999" />
      </AreaChart>
    )
  }

  render () {
    try {
      return (
        <ResponsiveContainer debounce={1} width="100%" height="100%">
          { this.getChart() }
        </ResponsiveContainer>
      )
    } catch (e) {
      console.log(e)
      return (<div></div>)
    }
  }
}

/*
<Grid.Row>
  <Grid.Column width={16}>
  <Statistic.Group widths='one' size="small">
    <Statistic>
      <Statistic.Value>
        {changeFiat > 0 ?
          (<Icon name="chevron up" color="green" />) :
          (<Icon name="chevron down" color="red" />)}
        &nbsp
        <FormattedNumber
         value={changeFiat}
         style="currency"
         currency={currency.code}/>
         &nbsp&nbsp/&nbsp&nbsp
         <FormattedNumber
         value={changePercent}
         maximumFractionDigits={2}
         style="percent" />
      </Statistic.Value>
      <Statistic.Label>In 1 Day</Statistic.Label>
    </Statistic>
  </Statistic.Group>
  </Grid.Column>
</Grid.Row>
*/

export default PortfolioGraph
