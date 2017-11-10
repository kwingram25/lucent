import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Avatar, Row, Col, Card } from 'antd'
import { FormattedNumber } from 'react-intl'

import Holding from '../Holding'

export default class HoldingGroup extends Component {
  getSourceName = (obj) => {
    return obj.wallet.exchange
      ? obj.wallet.exchange.name
      : obj.wallet.name
        ? obj.wallet.name
        : 'Unknown'
  }

  render () {
    const {group, groupBy, currency} = this.props
    const { getSourceName } = this

    let groupProps = {
      value: group.reduce((sum, holding) => sum + holding.value.current.total, 0),
      quantity: Math.max(group.reduce((sum, holding) => sum + holding.quantity, 0), 0)
    }
    const iconProps = {
      shape: 'square',
      size: 'large',
      className: 'holdings-group-icon'
    }
    switch (groupBy) {
      case 'TOKEN':
        Object.assign(groupProps, {
          icon: (<Avatar {...iconProps} src={require(`static/images/tokens/64x64/${group[0].currency.imageId}.png`)}/>),
          header: group[0].currency.code,
          subheader: group[0].currency.name
        })
        break
      case 'EXCHANGE':
        Object.assign(groupProps, {
          icon: (<Avatar {...iconProps}>{group[0].wallet.exchange ? group[0].wallet.exchange.name[0] : 'O'}</Avatar>),
          header: getSourceName(group[0])
        })
        break
    }

    return (
      <Card>
        <Row gutter={24}>
          <Col className="holdings-group-details" md={10} xs={16}>
            {groupProps.icon}
            <div className="holdings-group-header">
              {groupProps.header}
              {(() => {
                if (groupBy === 'TOKEN') {
                  return (
                    <span className="holdings-group-header-value">
                      &nbsp;&middot;&nbsp;
                      <FormattedNumber
                        value={group[0].value.current.perUnit}
                        style="currency"
                        currency={currency.code} />
                    </span>
                  )
                }
              })()}
              {
                (() => {
                  if (groupProps.subheader) {
                    return (
                      <div className="holdings-group-subheader" style={{clear: 'left'}}>
                        {groupProps.subheader}
                      </div>
                    )
                  }
                })()
              }
            </div>
          </Col>
          <Col md={4} xs={8} className="holdings-group-stats">
            <div className="holdings-group-value">
              <FormattedNumber
                value={groupProps.value}
                style="currency"
                currency={currency.code} />
            </div>
            {groupBy === 'TOKEN' && <div className="holdings-group-quantity">
              <FormattedNumber
                value={groupProps.quantity || 0}
                maximumFractionDigits={groupProps.quantity < 0.01 ? 8 : 2} />
            </div>}
          </Col>
          <Col md={10} sm={24}>
            {
              group.map(holding => (<Holding
                key={holding._id}
                {...{holding, groupBy}}
              />
              ))
            }
          </Col>

        </Row>
      </Card>
    )
  }
}
