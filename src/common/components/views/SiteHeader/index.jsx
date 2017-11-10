import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {Header} from 'antd'
import {isEqual} from 'lodash'
import {
  StyledHeader,
  HeaderInner,
  Navicon,
  PageTitle,
  PageLogo,
  HeaderButton
} from './style'
import {Spacer} from 'styles/base'

class SiteHeader extends Component {
  shouldComponentUpdate (nextProps) {
    return !isEqual(nextProps, this.props)
  }

 static propTypes = {
   title: PropTypes.string,
   toggleSidebar: PropTypes.func,
   isLoggedIn: PropTypes.bool,
   isMobile: PropTypes.bool
 }

 render () {
   const {title, toggleSidebar, isMobile} = this.props

   return (
     <StyledHeader>
       <PageTitle className="lucent-logo">
          Lucent
       </PageTitle>
       <Spacer />
     </StyledHeader>
   )
 }
}

function mapStateToProps (state) {
  const {isMobile} = state.layout
  const {isLoggedIn} = state.me.auth
  return {
    isMobile,
    isLoggedIn
  }
}

export default connect(mapStateToProps)(SiteHeader)
