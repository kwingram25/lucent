import styled from 'styled-components'
import {media} from 'styles/utils'
import {Sidebar, Container} from 'semantic-ui-react'

export const PageLayout = styled.div`height: 100%;`

export const MainLayout = styled.div`

`

export const MainContent = styled.main`

`

export const SidebarSemanticPusherStyled = styled(Sidebar.Pusher)`
  height: 100%;
  overflow-y: scroll!important;
  transition-property: none !important;
  -webkit-overflow-scrolling: touch;

  ::-webkit-scrollbar {
    width: 0px!important;
  }
`

export const SidebarSemanticPushableStyled = styled(Sidebar.Pushable)`
  display: initial;
`

//  Margin - just to fill empty space
export const MainContainer = styled.div`

`

// margin-top: 2em;
// margin-bottom: 2em;
//
// &#main-container {
//   ${media.mdOnly`
//     width: 100% !important;
//   `}
//
//   ${media.smOnly`
//     width: 100% !important;
//   `}
// }
//
// > .grid,
// > * > .grid {
//   min-height: 100%;
// }

// display: flex;
// flex-grow: 1;
// padding-left: 1rem;
// padding-right: 1rem;
// ${media.md`
//   padding-top: 60px;
// `};
// ${media.lg`
//
// `};

// display: flex;
// flex-direction: column;
// min-height: 100%;
// color: ${props => props.theme.primaryTextColor};
// background-color: ${props => props.theme.primaryColorText};
