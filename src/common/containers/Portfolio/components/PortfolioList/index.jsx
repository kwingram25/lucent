import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import { Radio, Menu, Button, Icon } from 'antd'
import { FormattedNumber } from 'react-intl'

import _ from 'underscore'

import Holding from './components/Holding'
import HoldingGroup from './components/HoldingGroup'

import './style.css'

class PortfolioList extends Component {
  static propTypes = {
    portfolio: PropTypes.object.isRequired,
    setGroupBy: PropTypes.func,
    onAddButtonClicked: PropTypes.func
  }

  onClickGroupBy = (e) => {
    console.log('fucker')
    const { _id, groupBy } = this.props.portfolio.store.records
    const newGroupBy = e.target.value
    if (newGroupBy === groupBy) {
      return
    }

    this.props.setGroupBy(_id, newGroupBy)
  }

  onClickMenu = (item, key) => {
    console.log(key)
    if (key === 'add-button') {
      const { onAddButtonClicked } = this.props
      onAddButtonClicked()
    }
  }

  render () {
    try {
    // if (!this.props.holdings.isFinished || !this.props.portfolio.isFinished) return (<div></div>)

    // console.log("rendering list")
      const {onClickMenu} = this
      const {onAddButtonClicked} = this.props
      const {getServicesStatus, groupBy, currency, period, value} = this.props.portfolio.store.records
      const holdings = this.props.holdings.store.records.filter(h => h.visible)

      // console.log('asdfasdfasdfasdfasdf')
      // console.log(this.props.holdings.store.records)

      let grouped, i = 0, result = []

      const indexed = _.groupBy(holdings, h => h.groupIndex)
      Object.keys(indexed).forEach(g => {
        indexed[g] = indexed[g].sort((a, b) => a.index < b.index)
      })

      const groups = Object.keys(indexed).sort().map(groupIndex => {
        const group = indexed[groupIndex]
        return <HoldingGroup
          key={`holding-group-${groupIndex}`}
          {...{group, groupBy, currency}}
        />
      })
      //
      // switch (groupBy) {
      //   case 'TOKEN': {
      //     grouped = _.groupBy(holdings, h => h.groupIndex)
      //
      //     const panels = Object.keys(grouped).map((groupIndex) => {
      //       let group = grouped[groupIndex]
      //
      //       let tokenTotalQty = Math.max(group.reduce((sum, holding) => sum + holding.quantity, 0), 0)
      //       let tokenTotalValue = group.reduce((sum, holding) => sum + holding.value.current.total, 0)
      //       let tokenLogo = require(`static/images/tokens/32x32/${group[0].currency.imageId}.png`)
      //       return {
      //         key: `panel ${groupIndex}`,
      //         title: (
      //           <Grid columns='equal'>
      //             <Grid.Row>
      //               <Grid.Column>
      //                 <Item.Group unstackable>
      //                   <Item className='token-details'>
      //                     <Item.Image className='token-image' size="tiny" width="32px" height="32px" src={tokenLogo} />
      //                     <Item.Content>
      //                       <Item.Header>{group[0].currency.code}</Item.Header>
      //                       <Item.Meta>{group[0].currency.name}</Item.Meta>
      //                     </Item.Content>
      //                   </Item>
      //                 </Item.Group>
      //               </Grid.Column>
      //               <Grid.Column>
      //                 <Item.Group unstackable>
      //                   <Item className="totalValue">
      //                     <Item.Content>
      //                       <Item.Description >
      //                         <FormattedNumber
      //                           value={tokenTotalValue}
      //                           style="currency"
      //                           currency={currency.code} />
      //                       </Item.Description>
      //                       <Item.Meta>
      //                         <FormattedNumber
      //                           value={tokenTotalQty || 0}
      //                           maximumFractionDigits={tokenTotalQty < 0.01 ? 8 : 2} />
      //                       </Item.Meta>
      //                     </Item.Content>
      //                   </Item>
      //                 </Item.Group>
      //               </Grid.Column>
      //             </Grid.Row>
      //           </Grid>
      //         ), /* */
      //         content: group.map((holding, index) => {
      //           const holdingQty = Math.max(0, holding.quantity)
      //           const holdingValue = Math.max(0, holding.value.current.total)
      //           return (
      //             <Grid key={holding._id} columns='equal'>
      //               <Grid.Row>
      //                 <Grid.Column>
      //                   {holding.wallet.exchange ? holding.wallet.exchange.name : holding.wallet.name}
      //                 </Grid.Column>
      //                 <Grid.Column>
      //                   <FormattedNumber value={holdingQty || 0} maximumFractionDigits={holdingQty < 0.01 ? 8 : 2} />
      //                 </Grid.Column>
      //                 <Grid.Column>
      //                   <FormattedNumber value={holdingValue || 0} maximumFractionDigits={holdingValue < 0.01 ? 8 : 2} style="currency" currency={currency.code}/>
      //                 </Grid.Column>
      //               </Grid.Row>
      //               {(index < group.length - 1) ? null
      //                 : (
      //                   <Grid.Row>
      //                     <Grid.Column width={16}>
      //                       <Divider />
      //                     </Grid.Column>
      //                   </Grid.Row>
      //                 )
      //               }
      //             </Grid>
      //           )
      //         })
      //
      //       }
      //     })

      return (
        <div className="portfolio-panel">
          <Menu mode="horizontal">
            <b style={{}}>Group By:&nbsp;&nbsp;</b>
            <Radio.Group defaultValue={groupBy} onChange={this.onClickGroupBy}>
              <Radio.Button value="TOKEN">Token</Radio.Button>
              <Radio.Button value="EXCHANGE">Source</Radio.Button>
            </Radio.Group>
            <Button.Group style={{float: 'right'}}>
              <Button onClick={() => { onAddButtonClicked() }} key="add-button" type="secondary" icon="plus">
                Add
              </Button>
            </Button.Group>
          </Menu>
          {groups}
        </div>
      )

      // for (let tokenId in grouped) {
      //   // groups.push({
      //   //   token: grouped[tokenId][0].currency,
      //   //   holdings: grouped[tokenId].map(h => {delete h.currency; return h;})
      //   // })
      //     let group = grouped[tokenId]
      //
      //
      //     result.push(
      //       <Accordion styled>
      //       <Header as='h3' key={i++}>{group[0].currency.name}</Header>
      //     )
      //     group.forEach(holding => {
      //       result.push(
      //         <div key={i++}>
      //           {holding.wallet.exchange ? holding.wallet.exchange.name : holding.wallet.name}
      //           &nbsp;&ndash;&nbsp
      //           <FormattedNumber value={holding.quantity || 0} maximumFractionDigits={2} />
      //           &nbsp;&ndash;&nbsp
      //           <FormattedNumber value={holding.value.current.total || 0} style="currency" currency={currency.code}/>
      //         </div>)
      //     })
      //
      // }

      // if (groupBy === 'TOKEN') {
      //
      //   } else {
      //     holdings.forEach(group => {
      //       // console.log(group.exchange.name)
      //       result.push(<h2 key={i++}>{group.exchange.name}</h2>)
      //       // console.log(result)
      //       group.holdings.forEach(holding => {
      //         result.push(<div key={i++}>{holding.currency.name} &ndash; {holding.quantity}</div>)
      //       })
      //     })
      //   }

      // this.endpoints = endpoints
      // // console.log(this.endpoints)
      // if (this.interval === undefined) {
      //   const fetchObj = {
      //     portfolio: { _id: this.props.portfolio.store.records._id },
      //     base: currency.code,
      //     toFetch: endpoints
      //   }
      //   // console.log(fetchObj)
      //   this.interval = setInterval(this.fetchPrices(fetchObj), 10000)
      // }
      //
      //
    } catch (e) {
      console.log(e)
      return (<div></div>)
    }
  }
}

const mapStateToProps = (state) => {
  return {
    holdings: state.holdings,
    portfolio: state.portfolio
  }
}

const mapDispatchToProps = (dispatch, { services }) => ({

  setGroupBy: (_id, groupBy) => {
    services.portfolio.patch(
      _id,
      {
        groupBy
      }
    )
  },

  saveLatest: ({holdings, portfolio}) => {
    dispatch(services.portfolio.patch(portfolio._id, portfolio))

    holdings.forEach(h => {
      dispatch(services.holdings.patch(h._id, h))
    })
    // dispatch(services.holdings.patch(null, holdings, { query: {
    //   _id: {
    //     $in: holdings.map(h => h._id)
    //   }
    // }}))
  },

  onCreate: () => {
    // dispatch(services.holdings.create({ text }))
  },
  onGet: () => {
    // dispatch(services.messages.get(id))
  },
  onPatch: (portfolio) => {
    dispatch(services.portfolio.patch(portfolio._id, portfolio))
  },
  onUpdate: (portfolio) => {
    dispatch(services.portfolio.update(portfolio))
  },
  onRemove: () => {
    // dispatch(services.messages.remove(id))
  },
  onFind: () => {
    // dispatch(services.holdings.find())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioList)
