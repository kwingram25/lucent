import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Button, Modal, Form, Input, InputNumber, Avatar, Radio, DatePicker, Select } from 'antd'
const FormItem = Form.Item

import {getTokenImage} from 'components/tokens'

import './style.css'

class NewEventModal extends React.Component {
  state = {
    eventType: 'buy',
    markets: [],
    exchange: undefined,
    token: undefined,
    base: undefined
  }

  constructor (props) {
    super(props)

    const { socket } = props
    socket.on('exchangeMarkets', (data) => {
      this.setState({markets: data})
    })
  }

  ifFieldsEmpty = fields => {
    return fields.reduce((prev, curr) => {
      console.log(this.state[curr])
      return prev && (this.state[curr] === undefined)
    }, true)
  }

  insertCommas = (n) => {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  formatInputField = (value) => {
    if (value === '' || value === undefined) return ''
    const {insertCommas} = this
    let [pre, post] =
        value.includes('.')
          ? value.toString().split('.')
          : [value, '']

    if (post.length > 8) {
      console.log(parseFloat(post) / 1e8)
      post = Math.round(parseFloat(post) / 1e8).toFixed(8)
      console.log(post)
    }
    return `${insertCommas(pre)}.${post.padEnd(8, '0')}`
  }

  parseInputField = (value) => value.replace(',', '')

  handleEventTypeChange = (e) => {
    this.setState({ eventType: e.target.value })
  }

  ConditionalField = (props) => {
    const {matches, ...rest} = props
    return (<div {...rest} style={{ display: matches.includes(this.state.eventType) ? 'block' : 'none' }}>
      {props.children}
    </div>
    )
  }

  onSelectExchange = (value) => {
    console.log(value)
    console.log(this.props)
    const { exchanges, socket } = this.props
    const { _id, id } = exchanges[value]
    const exchange = id
    const base = this.props.portfolio.store.records.currency.code || 'USD'
    this.setState({exchange: _id})
    socket.emit('getMarkets', {exchange, base})
  }

  onSelectMarket = async (value) => {
    const [base, token] = value.split('-')
    this.setState({
      token,
      base
    })
  }

  tradePriceDidChange = (value) => {

  }

  async componentDidMount () {
    const res = await this.props.getExchanges()
    console.log('got exc')
    console.log(res)
    this.exchanges = res
  }

  componentShouldUpdate (nextState, nextProps) {
    console.log('componentShouldUpdate')
    console.log(_.omit(nextState, function (v, k) { return this.state[k] === v }))
    console.log(_.omit(nextProps, function (v, k) { return this.props[k] === v }))
    return true
  }

  render () {
    const {
      ConditionalField,
      onSelectExchange,
      onSelectMarket,
      tradePriceDidChange,
      formatInputField,
      parseInputField,
      ifFieldsEmpty } = this
    const { visible, onCancel, onCreate, form, exchanges, socket } = this.props
    const { getFieldDecorator } = form
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      }
    }
    console.log(socket)

    const dateConfig = {
      rules: [{ type: 'object', required: true, message: 'Please select time!' }]
    }
    console.log(onSelectExchange)

    const iconProps = {
      shape: 'square',
      size: 'tiny'
    }

    return (
      <Modal
        visible={visible}
        title="Update Holdings"
        okText="Create"
        onCancel={onCancel}
        onOk={onCreate}
      >
        <Form layout="vertical">

          <FormItem {...formItemLayout} label="New Event:">
            <Radio.Group onChange={this.handleEventTypeChange} defaultValue={this.state.eventType}>
              <Radio.Button value="buy">Buy</Radio.Button>
              <Radio.Button value="sell">Sell</Radio.Button>
              <Radio.Button value="transfer">Transfer</Radio.Button>
            </Radio.Group>
          </FormItem>

          <ConditionalField matches={['buy', 'sell', 'transfer']}>
            <FormItem
              {...formItemLayout}
              label="Date"
            >
              {getFieldDecorator('date-time-picker', dateConfig)(
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
              )}
            </FormItem>
          </ConditionalField>

          <ConditionalField matches={['buy', 'sell']}>
            <FormItem
              {...formItemLayout}
              label="Exchange"
              hasFeedback
            >
              {getFieldDecorator('exchange', {
                rules: [
                  { required: ['buy', 'sell'].includes(this.state.eventType), message: 'Please select an exchange' }
                ]
              })(
                <Select key="dropdown-exchange" onChange={onSelectExchange} placeholder="Please select an exchange">
                  {Object.values(exchanges).map(exchange => {
                    return (
                      <Select.Option key={exchange._id} value={exchange._id}>
                        <span>{exchange.name}</span>
                      </Select.Option>
                    )
                  })}
                </Select>
              )}
            </FormItem>
          </ConditionalField>

          <ConditionalField matches={['buy', 'sell']}>
            <FormItem
              {...formItemLayout}
              label="Market"
              hasFeedback
            >
              {getFieldDecorator('market', {
                rules: [
                  { required: ['buy', 'sell'].includes(this.state.eventType), message: 'Please select a market' }
                ]
              })(
                <Select key="dropdown-market" onChange={onSelectMarket} placeholder="Please select a market">
                  {this.state.markets.map(market => {
                    const {symbol, token} = market
                    const tokenImage = getTokenImage(token)
                    const iconProps = {
                      size: 'tiny',
                      shape: 'square',
                      src: tokenImage || undefined
                    }
                    console.log(market)
                    return (
                      <Select.Option key={token._id} value={symbol}>
                        {tokenImage
                          ? <Avatar {...iconProps} />
                          : <Avatar {...iconProps}>{token.name[0]}
                          </Avatar>}
                        {symbol}
                        <span>{token.name}</span>
                      </Select.Option>
                    )
                  })}
                </Select>
              )}
            </FormItem>
          </ConditionalField>

          <FormItem
            {...formItemLayout}
            label="Trade Price"
            hasFeedback
          >
            {getFieldDecorator('trade-price', {
              rules: [{

              }]
            })(
              <Input
                className='currency-input'
                onChange={e => { console.log(e.value) }}
                onBlur={e => {
                  e.target.value = formatInputField(e.target.value)
                }}
                onFocus={e => {
                  e.target.value = parseInputField(e.target.value)
                }}
              />
            )}
            {this.state.token && <span> {this.state.token}</span>}
          </FormItem>
        </Form>
        <code>{JSON.stringify(_.omit(this.state, 'markets'))}</code>
      </Modal>
    )
  }
}
//        <!--{JSON.stringify(this.state)}-->

const mapStateToProps = (state) => {
  return {
    portfolio: state.portfolio,
    exchanges: _.keyBy(state.exchanges.queryResult, '_id') || {}
  }
}

const mapDispatchToProps = (dispatch, { services }) => ({
  getExchanges: () => {
    console.log(services)
    services.exchanges.find()
  }
})
//
// {getFieldDecorator('trade-price', {
//   // trigger: 'onBlur'
//   // rules: [{
//   //   required: true,
//   //   message: 'Enter price per unit'
//   // }, {
//   //   min: 0,
//   //   message: 'Must be greater than zero'
//   // }]
// })(
//
// )}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(NewEventModal))
