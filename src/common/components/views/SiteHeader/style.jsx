import styled from 'styled-components'
import {media} from 'styles/utils'
import {Button} from 'semantic-ui-react'
import {Layout} from 'antd'

export const StyledHeader = styled(Layout.Header)`

`
export const HeaderInner = styled.div`
  display: flex;
  padding: 0 15px;
  ${'XXX: maybe it\'s better to use `em`s?'}
`

export const PageTitle = styled.span`
  line-height: 1;
  font-size: 20px;
  align-items: center;
  display: flex;
  color: #DDD;
`
export const PageLogo = styled.b`
  font-size: 110%;
  font-weight: bold;
  color: #FFF;

  &:after {
    content: '/';
    padding: 0 6px;
    font-size: initial;
  }
`

export const Navicon = styled.span`
  width: 48px;
  height: 48px;
  padding: 12px;
  line-height: 1;
  font-size: 24px;
  display: none;
  ${media.md`
    display: block;
  `};
`

export const HeaderButton = styled(Button)`
  &#header-button {
    align-self: center;
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    color: ${props => props.theme.primaryColorText}!important;
    background-color: ${props => props.theme.primaryColorDark}!important;
  }
`

// background: ${props => props.theme.primaryColor};
// border-bottom: 1px solid ${props => props.theme.primaryColorDark};
// box-shadow: inset 0 0 0 0 ${props => props.theme.primaryColorDark},
//   0 2px 1px 0 ${props => props.theme.primaryColorDark};
// color: ${props => props.theme.primaryColorText};
// display: flex;
// justify-content: center;
// flex-direction: column;
// width: 100%;
// position: fixed;
// z-index: 444;
// height: 60px;
// ${media.md`
//
// `};
// ${media.lg`
//   display: none;
// `};
