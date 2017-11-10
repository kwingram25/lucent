import {
  UI_OPEN_SIDEBAR,
  UI_CLOSE_SIDEBAR,
  UI_WINDOW_RESIZE,
  UI_OPEN_DIMMER,
  UI_CLOSE_DIMMER,
  LOCATION_CHANGE,
  APPLICATION_INIT
} from 'actions'

export const initialState = {
  sidebarOpened: true,
  showDimmer: false,
  isMobile: false,
  isMobileXS: false,
  isMobileSM: false
}

export const breakpoints = {
  xl: 1200,
  lg: 992,
  md: 768,
  sm: 576
}

export function layout (state = initialState, action) {
  const computeMobileStatuses = () => {
    const innerWidth = process.env.BROWSER ? window.innerWidth : 1024
    const isMobile = innerWidth < breakpoints.sm - 1 // 1024px - is the main breakpoint in UI
    const isMobileXS = innerWidth < 481
    const isMobileSM = innerWidth > 480 && innerWidth < 767
    return {isMobileSM, isMobileXS, isMobile, sidebarOpened: !isMobile}
  }
  switch (action.type) {
    case APPLICATION_INIT:
    case UI_WINDOW_RESIZE: {
      const {isMobile, isMobileSM, isMobileXS, sidebarOpened} = computeMobileStatuses()
      console.log(sidebarOpened + ' cunts')
      return {
        ...state,
        sidebarOpened,
        isMobile,
        isMobileSM,
        isMobileXS
      }
    }
    case UI_OPEN_SIDEBAR:
      return {
        ...state,
        sidebarOpened: true
      }
    case LOCATION_CHANGE:
    case UI_CLOSE_SIDEBAR:
      return {
        ...state,
        sidebarOpened: false
      }
    case UI_OPEN_DIMMER:
      return {
        ...state,
        showDimmer: true
      }
    case UI_CLOSE_DIMMER:
      return {
        ...state,
        showDimmer: false
      }
    default:
      return state
  }
}
