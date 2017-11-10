import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {isEqual} from 'lodash'
import {CLOSE_SIDEBAR} from 'actions/layout'
import { StyledDimmer } from './style'
import { Dimmer } from 'semantic-ui-react'

class SiteDimmer extends Component {
  static propTypes = {
    active: PropTypes.bool,
    onClick: PropTypes.function
  }

  render () {
    return (
      <Dimmer {...this.props} />
    )
  }
}

function mapStateToProps (state) {
  const {sidebarOpened, isMobile} = state.layout
  return {
    active: isMobile && sidebarOpened
  }
}

function mapDispatchToProps (dispatch) {
  return {
    onClick: () => {
      dispatch(CLOSE_SIDEBAR())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SiteDimmer)
