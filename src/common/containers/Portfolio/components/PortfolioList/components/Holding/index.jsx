import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Label } from 'semantic-ui-react'
import { Avatar } from 'antd'
import { FormattedNumber } from 'react-intl'

export default class Holding extends Component {
  render () {
    const { holding, groupBy } = this.props
    let holdingProps,
      iconProps = {
        shape: 'square',
        size: 'small',
        className: 'holding-icon'
      },
      linkProps = {
        to: '#',
        className: 'holding-link'
      }

    switch (groupBy) {
      case 'TOKEN':
        holdingProps = {
          text: holding.wallet.exchange ? holding.wallet.exchange.name : holding.wallet.name ? holding.wallet.name : 'Unknown',
          number: <FormattedNumber
            value={holding.quantity || 0}
            maximumFractionDigits={holding.quantity < 0.01 ? 8 : 2} />
          // icon: <Avatar {...iconProps}>
          //   {holding.wallet.exchange ? holding.wallet.exchange.name[0] : 'O'}
          // </Avatar>
        }
        break
      case 'EXCHANGE':
        holdingProps = {
          text: holding.currency.code ? holding.currency.code : 'Unknown',
          number: <FormattedNumber
            value={holding.quantity || 0}
            maximumFractionDigits={holding.quantity < 0.01 ? 8 : 2} />,
          icon: <Avatar {...iconProps}
            src={require(`static/images/tokens/64x64/${holding.currency.imageId}.png`)}>
            {holding.currency.name[0]}
          </Avatar>
        }
    }

    return (
      <Label as='a' image>
        {holdingProps.icon && holdingProps.icon}
        {holdingProps.text}
        <Label.Detail>{holdingProps.number}</Label.Detail>
      </Label>

    )
  }
}

// <Link {...linkProps}>
//   {holdingProps.icon}
//   {holdingProps.text} &middot; {holdingProps.number}
// </Link>
