import {Dimmer} from 'semantic-ui-react'
import styled from 'styled-components'

export const StyledDimmer = styled.div`
  position: absolute;
  width: 100%;
  height:100%;
  top: 0;
  left: 0;
  background:rgba(0,0,0,0.6);
  display: none;
  opacity: 0;
  transition: all 0.2s;
  -webkit-transition: all 0.2s;
  z-index: 55 !important;
  cursor: pointer;
`
