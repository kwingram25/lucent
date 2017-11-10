import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import { Loader } from 'semantic-ui-react'
import {Helmet} from 'react-helmet'
import PortfolioComponent from './components'
//
// import DashboardComponent from './components'
import startRealtime from 'common/feathers/realtime'

class Portfolio extends Component {
  static propTypes = {
    services: PropTypes.object.isRequired,
    portfolio: PropTypes.object.isRequired,
    holdings: PropTypes.object.isRequired,
    transactions: PropTypes.object.isRequired,

    reloading: PropTypes.object,

    getPortfolio: PropTypes.func,
    getHoldings: PropTypes.func,
    getTransactions: PropTypes.func
  }

  componentDidMount () {
    // const { services, client, getPortfolio } = this.props
    //
    // // getPortfolio()
    // if (this.realtime === undefined) {
    //   this.realtime = startRealtime(client, services, ['portfolio', 'holdings', 'transactions'])
    // }
    //
    // services.portfolio.find({query: {demo: true}}).then(res => {
    //   console.log(res)
    //   services.holdings.find({query: {portfolio: res._id, visible: true}})
    //   services.transactions.find({query: {portfolio: res._id, $sort: {date: -1}}})
    // })
    // startRealtime()
  }

  shouldComponentUpdate (nextProps, nextState) {
    console.log('balls')
    console.log(nextProps)
    // const ignore = ['sidebarOpened', 'isMobile', 'isMobileXS', 'isMobileSM']
    //
    // return Object.keys(nextProps)
    //   .filter(p => nextProps[p] !== this.props[p])
    //   .reduce((prev, curr) => prev || !(ignore.includes(curr)), true)
    return true
  }

  render () {
    console.log(this.props.services)

    return (
      <div>
        <Helmet>
          <title>Portfolio</title>
        </Helmet>
        {
          (() => {
            const { services } = this.props
            const portfolio = this.props.portfolio.store ? this.props.portfolio.store.records : undefined
            const holdings = this.props.holdings.store ? this.props.holdings.store.records : undefined
            const transactions = this.props.transactions.store ? this.props.transactions.store.records : undefined

            const finished =
              portfolio &&
              holdings &&
              transactions

            return finished
              ? <PortfolioComponent services={services} />
              : <Loader active>Loading</Loader>
          })()
        }
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    holdings: state.holdings,
    portfolio: state.portfolio,
    transactions: state.transactions
  }
}

function mapDispatchToProps (dispatch, { services }) {
  return {
    getPortfolio () {
      return dispatch(
        services.portfolio.find({demo: true})
          .then(res => {
            const { _id } = res
            services.holdings.find({portfolio: _id})
            services.transactions.find({portfolio: _id})
          })
      )
    }

    // getHoldings (_id) => {
    //   dispatch(
    //     services.holdings.find({portfolio: _id})
    //   )
    // },
    //
    // getTransactions: (_id) => {
    //   dispatch(
    //     services.transactions.find({portfolio: _id})
    //   )
    // },

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Portfolio)
