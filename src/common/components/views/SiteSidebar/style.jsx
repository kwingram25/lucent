import { Layout, Menu } from 'antd'
import { NavLink } from 'react-router-dom'
const { Sider } = Layout
import styled from 'styled-components'
import {media} from 'styles/utils'

// ${'combine sidebar with dimmer, when sidebar is visible on mobile'}
//   color: ${props => props.theme.primaryColorText}!important;
// ${'' /* background-color: ${props => props.theme.accentColor}!important; */}
export const StyledSider = styled(Sider)`
`
// box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);

export const SidebarLogo = styled(NavLink)`
  display: block;
  line-height: 64px;
  height: 64px;
  font-size: 24px;
  text-align: center;
`
//
export const SidebarLogoContainer = styled.div`
  color: ${props => props.theme.primaryColorText};
  font-weight: bold;
  padding: 25px;
  text-align: center;
  ${media.md`
    padding: 25px;
  `};
  ${media.lg`
    padding: 20px;
  `};
`
// Color: ${props => props.theme.primaryColorText}!important;
export const SidebarItem = styled(Menu.Item)`
  &:not(.active, .header):hover {
    background: #2A2A2A !important;
    background-color: #2A2A2A !important;
  }

  &.active.active.active.active {
    color: ${props => props.theme.accentColor} !important;
    background: #555 !important;
    background-color: #555 !important;

    &:hover {
      color: ${props => props.theme.accentColor} !important;
      background: #555 !important;
      background-color: #555 !important;
    }
  }
`
//
export const SidebarLogoutItem = SidebarItem.extend`
  cursor: pointer;
  border-top: 1px solid rgba(34, 36, 38, 0.15) !important;
`
