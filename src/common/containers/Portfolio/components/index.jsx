import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Container, Dropdown } from 'semantic-ui-react'
import { Affix, Button, Row, Col, Modal } from 'antd'
import PropTypes from 'prop-types'
import _ from 'lodash'

import PortfolioSummary from './PortfolioSummary'
import PortfolioList from './PortfolioList'
import PortfolioHistory from './PortfolioHistory'
import NewEventForm from './NewEventForm'

import createSocket from '../../../../client/socket.io'

import './style.less'

class PortfolioComponent extends Component {
  static propTypes = {
    portfolio: PropTypes.object.isRequired,
    holdings: PropTypes.object.isRequired,
    transactions: PropTypes.object.isRequired,
    reloading: PropTypes.object,

    setPeriod: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      reloading: {
        summary: {
          all: false,
          graph: false
        },
        list: false,
        transactions: false
      },
      modalVisible: false,
      processingTransaction: false
    }
    this.socket = createSocket()
    this.socket.connect()
  }

  // shouldComponentUpdate (nextProps) {
  //   const {posts} = this.props
  //   const nextPosts = nextProps.posts
  //   return !_.isEqual(posts, nextPosts)
  // }
  componentWillMount () {

  }

  componentWillUnmount () {
    this.socket.disconnect()
  }

  onAddButtonClicked = () => {
    console.log('onAddButtonClicked')
    this.setState({
      modalVisible: true
    })
  }

  onModalSubmit = (e) => {
    this.setState({
      modalVisible: false
    })
  }
  onModalCancel = (e) => {
    this.setState({
      modalVisible: false
    })
  }

  render () {
    console.log('buttfuck')
    console.log(this.props)
    // {count, postsLoading}
    const { onAddButtonClicked, onModalCancel, onModalSubmit, socket } = this
    const { services } = this.props
    const { reloading, modalVisible, processingTransaction } = this.state
    const portfolio = this.props.portfolio.store.records
    const holdings = this.props.holdings.store.records
    const transactions = this.props.transactions.store.records
    const { _id, period } = portfolio

    const modalProps = {
      services,
      socket,
      visible: modalVisible,
      confirmLoading: processingTransaction,
      onCreate: onModalSubmit,
      onCancel: onModalCancel
    }

    return (

      <div style={{padding: '0 1rem'}}>
        <Row gutter={24}>
          <Col span={24}>
            <PortfolioSummary
              {...{services, reloading: reloading.summary || {all: false, graph: false}}}
            />
          </Col>
        </Row>
        <Row gutter={24}>
          <Col lg={16} sm={24}>
            <PortfolioList
              {...{services, onAddButtonClicked, reloading: reloading.list || false}}
            />
          </Col>
          <Col lg={8} sm={24}>
            <PortfolioHistory
              {...{transactions, onAddButtonClicked, reloading: reloading.transactions || false}}
            />
          </Col>
        </Row>
        <NewEventForm {...modalProps}/>
      </div>
    )
  }
}

// {/* <PortfolioHistory
// ...{transactions, reloading: reloading.transactions || false}
// /> */}

function mapStateToProps (state) {
  return {
    holdings: state.holdings,
    portfolio: state.portfolio,
    transactions: state.transactions
  }
}

function mapDispatchToProps (dispatch, { services }) {
  return {
    setPeriod (_id, period) {
      console.log(services)
      dispatch(
        services.portfolio.patch(
          _id,
          {
            period
          }
        )
      )
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioComponent)
