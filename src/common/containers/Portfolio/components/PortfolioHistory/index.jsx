import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import io from 'socket.io-client'
import moment from 'moment'

import { Button, Menu, Feed, Image } from 'semantic-ui-react'
import { FormattedNumber } from 'react-intl'

import _ from 'underscore'

// import styles from './PortfolioList.css';

class PortfolioTransfers extends Component {
  componentDidMount () {

  }

  componentWillUnmount () {
    // clearInterval(this.interval);
    // this.socket.disconnect();
  }

  render () {
    // console.log(this.props)

    try {
    // if (!this.props.holdings.isFinished || !this.props.portfolio.isFinished) return (<div></div>);

    // console.log("rendering list");

      const transactions = this.props.transactions.store.records
      //
      //
      //
      // <Item.Group unstackable>
      //   <Item className={styles['token-details']}>
      //     <Item.Image className={styles['token-image']} size="tiny" width="32px" height="32px" src={tokenLogo} />
      //     <Item.Content>
      //       <Item.Header>{group[0].currency.code}</Item.Header>
      //       <Item.Meta>{group[0].currency.name}</Item.Meta>
      //     </Item.Content>
      //   </Item>
      // </Item.Group>

      // return (
      //   <Segment>
      //     <Menu pointing secondary>
      //       <Menu.Item header>Group By</Menu.Item>
      //       <Menu.Item name='Token' active={groupBy === 'TOKEN'} />
      //       <Menu.Item name='Source' active={groupBy === 'EXCHANGE'} />
      //       <Menu.Menu position="right">
      //         <Menu.Item>
      //           <Button primary>Add</Button>
      //         </Menu.Item>
      //       </Menu.Menu>
      //     </Menu>
      //     <Accordion className={styles['token-group']} exclusive={false} panels={panels}/>
      //   </Segment>
      //
      // );

      return (
        <div className="portfolio-panel">
          <Menu pointing secondary>
            <Menu.Item header>Recent Activity</Menu.Item>
          </Menu>
          <Feed>
            {transactions.map(transaction => {
              let quantity, summary, currency, source
              switch (transaction.__t) {
                case 'Transfer':
                  // console.log(transaction);

                  // summary = `Sent ${transaction.quantity} ${transaction.currency.code} from ${transaction.from.wallet.name || 'a wallet'} to ${transaction.to.wallet.name || 'a wallet'}`;
                  let toName = transaction.to.exchange === undefined ? transaction.to.name : transaction.to.exchange.name
                  currency = transaction.currency
                  quantity = parseFloat(transaction.quantity.toFixed(2))
                  source = transaction.from.exchange === undefined ? transaction.from.name : transaction.from.exchange.name

                  summary = [
                    `Transferred`,
                    quantity.toLocaleString(),
                    currency.code,
                    'to',
                    toName
                  ]

                  break
                case 'Trade':
                  source = transaction.exchange === undefined ? '' : transaction.exchange.name

                  switch (transaction.type) {
                    case 'BUY':
                      // summary = `Bought ${transaction.pair.buying.quantity} ${transaction.pair.buying.currency.code} on ${transaction.pair.buying.wallet.exchange.name || 'an exchange'}`;
                      currency = transaction.pair.buying.currency
                      quantity = parseFloat(transaction.pair.buying.quantity.toFixed(2))

                      summary = [
                        `Bought`,
                        quantity.toLocaleString(),
                        currency.code
                      ]
                      break
                    case 'SELL':
                      // summary = `Sold ${transaction.pair.selling.quantity} ${transaction.pair.selling.currency.code} on ${transaction.pair.selling.wallet.exchange.name || 'an exchange'}`;
                      currency = transaction.pair.selling.currency
                      quantity = parseFloat(transaction.pair.selling.quantity.toFixed(2))

                      summary = [
                        `Sold`,
                        quantity.toLocaleString(),
                        currency.code
                      ]

                      break
                  }

                  break
              }
              let tokenLogo = require(`static/images/tokens/32x32/${currency.imageId}.png`)
              return (
                <Feed.Event key={transaction._id}>
                  <Feed.Label>
                    <img src={tokenLogo}/>
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Date>{moment(transaction.date).fromNow()} &middot; {source}</Feed.Date>
                    <Feed.Summary>
                      {summary.join(' ')}
                    </Feed.Summary>
                  </Feed.Content>
                </Feed.Event>
              )
            })
            }
          </Feed>
        </div>
      )
    //
    // return (
    //   <Segment>
    //     { result }
    //   </Segment>);
    } catch (e) {
    // console.log(e);
      return (<div></div>)
    }
  }
}

const mapStateToProps = (state) => {
  return {
    transactions: state.transactions
  }
}

const mapDispatchToProps = (dispatch, { services }) => ({

  // saveLatest: ({holdings, portfolio}) => {
  //
  //   dispatch(services.portfolio.patch(portfolio._id, portfolio));
  //
  //   holdings.forEach(h => {
  //     dispatch(services.holdings.patch(h._id, h));
  //   });
  //   // dispatch(services.holdings.patch(null, holdings, { query: {
  //   //   _id: {
  //   //     $in: holdings.map(h => h._id)
  //   //   }
  //   // }}));
  // },
  //
  // onCreate: () => {
  //   //dispatch(services.holdings.create({ text }));
  // },
  // onGet: () => {
  //   //dispatch(services.messages.get(id));
  // },
  // onPatch: (portfolio) => {
  //   dispatch(services.portfolio.patch(portfolio._id, portfolio));
  // },
  // onUpdate: (portfolio) => {
  //   // console.log(services);
  //   dispatch(services.portfolio.update(portfolio));
  // },
  // onRemove: () => {
  //   //dispatch(services.messages.remove(id));
  // },
  // onFind: () => {
  //   //dispatch(services.holdings.find());
  // },
})

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioTransfers)

/* const cards = () => {
    return contacts.map(contact => {
      return (
        <ContactCard
          key={contact._id}
          contact={contact}
          deleteContact={deleteContact}
        />
      )
    })
  }; */
