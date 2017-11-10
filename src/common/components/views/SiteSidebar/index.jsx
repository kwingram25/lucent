import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import { Layout, Menu, Icon, Affix } from 'antd'
import {NavLink} from 'react-router-dom'
import {CLOSE_SIDEBAR, OPEN_SIDEBAR} from 'actions/layout'
import {
  StyledSider,
  SidebarLogo,
  SidebarLogoContainer,
  SidebarItem,
  SidebarLogoutItem
} from './style'
import {Spacer} from 'styles/base'

class SiteSidebar extends Component {
 static propTypes = {
   open: PropTypes.bool.isRequired,
   location: PropTypes.any,
   logout: PropTypes.func.isRequired,
   routing: PropTypes.array.isRequired,
   isMobile: PropTypes.bool.isRequired,

   closedSidebar: PropTypes.func,
   openedSidebar: PropTypes.func
 }

 componentWillReceiveProps (nextProps) {
   //  const {sidebarOpened, isMobile} = this.props
   //  console.log('triggerrrrr')
   //  if (isMobile) {
   //    if (!nextProps.sidebarOpened && sidebarOpened) {
   //      this.setState({collapsed: true})
   //    } else if (nextProps.sidebarOpened && !sidebarOpened) {
   //      this.setState({collapsed: false})
   //    }
   //  }
 }

 render () {
   // ADD THIS:
   //  <div className="logo" />
   //  <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
   //    <Menu.Item key="1">
   //      <Icon type="user" />
   //      <span className="nav-text">nav 1</span>
   //    </Menu.Item>
   //    <Menu.Item key="2">
   //      <Icon type="video-camera" />
   //      <span className="nav-text">nav 2</span>
   //    </Menu.Item>
   //    <Menu.Item key="3">
   //      <Icon type="upload" />
   //      <span className="nav-text">nav 3</span>
   //    </Menu.Item>
   //    <Menu.Item key="4">
   //      <Icon type="user" />
   //      <span className="nav-text">nav 4</span>
   //    </Menu.Item>
   //  </Menu>

   const {location, logout, routing, sidebarOpened, openedSidebar, closedSidebar, isMobile} = this.props
   console.log(location)
   const sidebarProps = {
     routing,
     breakpoint: 'sm',
     collapsedWidth: 0,
     onCollapse: (collapsed, type) => {
       if (!collapsed) {
         openedSidebar()
       } else {
         closedSidebar()
       }
     }
   }
   const sidebarStyle = {
   }
   const menuProps = {
     theme: 'dark',
     mode: 'inline',
     selectedKeys: (() => routing
       .map(({path}, index) => ({path, index}))
       .filter(r => r.path === location.pathname)
       .map(({index}) => '' + (index + 1))
     )(),
     onClick: (i, k) => {
       this.selectedKeys = [k]
       if (isMobile) {
         console.log('assr')
         closedSidebar()
       }
     }
   }
   console.log(sidebarProps.selectedKeys)

   const routes = routing.map((route, i) => {
     const {external, path, icon, name, strict, exact} = route
     // Props that are applicable for both "plain link, i.e. <a>" and "RR Link"
     //  const basicProps = {
     //    as: external ? 'a' : NavLink,
     //    link: true,
     //    [external ? 'href' : 'to']: path
     //  }
     //
     //  // Is it's RR Link, then it has more props
     //  const externalProps = external
     //    ? {}
     //    : {
     //      strict,
     //      exact,
     //      activeClassName: 'active'
     //    }
     //
     //  // Summarize
     //  const propsMenuItem = {
     //    ...externalProps,
     //    ...basicProps
     //  }

     return (
       // <Menu.Item key="1">
     //   <Icon type="pie-chart" />
     //   <span>Option 1</span>
     // </Menu.Item>
       <SidebarItem key={`${i + 1}`}>
         <NavLink to={path}>
           <Icon type={icon} />
           <span>{name}</span>
         </NavLink>
       </SidebarItem>
     )
   })

   // const logoImg = process.env.BROWSER
   //   ? require('images/logo.png')
   //   : require('images/logo.png').preSrc
   //
   const logoImg = require('images/logo.png')

   return (
     <Layout.Sider style={sidebarStyle} {...sidebarProps}>
       <Affix top>
         <SidebarLogo className="app-logo" to="/">Lucent</SidebarLogo>
         <Menu {...menuProps}>
           {routes}
         </Menu>
         <Spacer />
       </Affix>
     </Layout.Sider>
   )
 }
}

function mapStateToProps (state) {
  const {isMobile, sidebarOpened} = state.layout
  return {
    isMobile, sidebarOpened
  }
}

function mapDispatchToProps (dispatch) {
  return {
    closedSidebar: () => {
      dispatch(CLOSE_SIDEBAR())
    },
    openedSidebar: () => {
      dispatch(OPEN_SIDEBAR())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SiteSidebar)
