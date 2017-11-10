import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { Loader, Segment, Statistic } from 'semantic-ui-react'
import { Row, Col, Divider, Menu, Dropdown, Button, Icon } from 'antd'
import { FormattedNumber } from 'react-intl'
import AnimateOnChange from 'react-animate-on-change'

import { getPeriodSinceText, getPeriodText } from 'common/utils'
import { periods } from 'common/config'

import PortfolioGraph from '../PortfolioGraph'

import './style.less'
// import {
//   Value,
//   DecreasedValue,
//   IncreasedValue
// } from './style'

class PortfolioSummary extends Component {
  state = {
    periodMenuVisible: false,
    currencyMenuVisible: false,
    reloading: {
      graph: false,
      all: false
    },
    baseCurrencies: []
  }

  static propTypes = {
    portfolio: PropTypes.object.isRequired,
    currencies: PropTypes.object.isRequired,
    reloading: PropTypes.object,

    setPeriod: PropTypes.func,
    getCurrencies: PropTypes.func
  }

  constructor (props) {
    super(props)

    console.log('asssss')
    console.log(props)

    // this.state = {
    //   reloading: {
    //     all: false,
    //     graph: false // props.reloading.graph || (() => {
    //     //   const { history, period } = props.portfolio
    //     //   return !(history[period].data && history[period].data.length > 0)
    //     // })()
    //   },
    //   currencies: []
    // }
  }

  componentDidMount () {
    const { getCurrencies } = this.props

    getCurrencies()
  }

  componentDidUpdate () {
    const { history, period } = this.props.portfolio.store.records

    if (history[period].data !== undefined) {
      // this.setState({reloading: {graph: false}})
    }
  }

  setPeriodFromMenu = async (_id, period) => {
    this.setState({reloading: {graph: true}})
    await this.props.setPeriod(_id, period)

    console.log('done setting')
    this.setState({reloading: {graph: false}})
  }

  render () {
    console.log(this.props)
    console.log(Divider)
    try {
      const { setPeriodFromMenu } = this
      const { _id, value, currency, history, period } = this.props.portfolio.store.records

      const totalValue = value.current || 0,
        compareValue = history[period] && history[period].data.length > 0 ? history[period].data[0].value || 0 : 0,
        changeFiat = compareValue !== undefined ? totalValue - compareValue : 0,
        changePercent = compareValue !== 0 ? changeFiat / compareValue : 0,
        graphData = history[period].data

      console.log(graphData)

      const totalValueElem = <FormattedNumber key="totalValue" value={totalValue} style="currency" currency={currency.code}/>

      return (
        <div className="portfolio-panel">
          <Row>
            <Col span={24}>
              <Menu mode="horizontal">
                <span style={{fontSize: '1rem'}}>My Portfolio</span>
                <Button.Group style={{float: 'right'}}>
                  <Dropdown overlay={
                    <Menu
                      selectedKeys={[period]}
                      onClick={item => setPeriodFromMenu(_id, item.key)}
                    >
                      {periods.map(p =>
                        <Menu.Item key={p}>{getPeriodText(p)}</Menu.Item>
                      )}
                    </Menu>
                  }>
                    <Button>
                      <Icon type="clock-circle-o" /> {getPeriodText(period)} <Icon type="down" />
                    </Button>
                  </Dropdown>
                  <Button onClick={this.props.getCurrencies}>
                    <Icon type="wallet" /> {currency.code} <Icon type="down" />
                  </Button>
                </Button.Group>
              </Menu>
            </Col>
          </Row>
          <Row>
            <Col sm={12} xs={24}>
              <Statistic.Group widths='one' size='small'>
                <Statistic className="portfolio-value-total">
                  <Statistic.Value>
                    <AnimateOnChange
                      animationClassName={value.diff > 0 ? 'stat-up' : 'stat-down'}
                      baseClassName={'stat-base'}
                      animate={value.diff !== 0}>
                      {totalValueElem}
                    </AnimateOnChange>
                  </Statistic.Value>
                  <Statistic.Label>Total Value</Statistic.Label>
                </Statistic>
              </Statistic.Group>
            </Col>
            <Col sm={12} xs={24}>
              <Statistic.Group widths='one' size='small'>
                <Statistic className="portfolio-value-change">
                  <Statistic.Value>
                    {changeFiat > 0
                      ? (<Icon type="up" style={{color: 'green'}} />)
                      : (<Icon name="down" style={{color: 'red'}} />)
                    }
                    <FormattedNumber
                      value={changeFiat}
                      style="currency"
                      currency={currency.code}/>
                    &nbsp;
                    <small>
                      (
                      <FormattedNumber
                        value={changePercent}
                        maximumFractionDigits={2}
                        style="percent" />
                      )
                    </small>
                  </Statistic.Value>
                  <Statistic.Label>
                    {getPeriodSinceText(period)}
                  </Statistic.Label>
                </Statistic>
              </Statistic.Group>
            </Col>
          </Row>
          <Row>
            <Col className={`graph-container-col${this.state.reloading.graph ? ' loading' : ''}`} span={24}>
              <PortfolioGraph
                data={graphData}
                period={period}
                code={currency.code}
                reloading={this.state.reloading.graph}
              />
              <Loader active />
            </Col>
          </Row>
        </div>)
    } catch (e) {
      console.log(e)
      return (<div></div>)
    }
  }
}
//
const mapStateToProps = (state) => {
  return {
    portfolio: state.portfolio,
    currencies: state.currencies
  }
}

const mapDispatchToProps = (dispatch, { services }) => ({
  setPeriod: (_id, period) => {
    services.portfolio.patch(
      _id,
      {
        period
      }
    )
  },
  getCurrencies: () => {
    console.log(services.currencies)
    services.currencies.find({
      query: {
        isBase: true
      }
    })
  }
})

// <Col sm={8} xs={12}>
//   <Statistic.Group widths='one' size='tiny'>
//     <Statistic className="portfolio-value-change">
//       <Statistic.Value>
//         {changeFiat > 0
//           ? (<Icon name="chevron up" color="green" />)
//           : (<Icon name="chevron down" color="red" />)
//         }
//                 &nbsp;
//         <FormattedNumber
//           value={changePercent}
//           maximumFractionDigits={2}
//           style="percent" />
//       </Statistic.Value>
//       <Statistic.Label>
//         {getPeriodSinceText(period)} (%)
//       </Statistic.Label>
//     </Statistic>
//   </Statistic.Group>
// </Col>

// <Dropdown
//   text={getPeriodText(period)}
//   icon='calendar' floating labeled button className='icon'>
//   <Dropdown.Menu>
//     {periods.map(p => {
//     // console.log(period);
//       return (
//         <Dropdown.Item
//           key={`dropdown-period-${p}`}
//           onClick={() => { this.props.setPeriod(_id, p) }}
//           content={getPeriodText(p)}
//           active={p === period}/>
//       )
//     }, this)}
//   </Dropdown.Menu>
// </Dropdown>

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioSummary)
