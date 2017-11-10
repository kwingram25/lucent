// Styles
import 'semantic-ui-css/semantic.css'
import 'antd/dist/antd.css'
import 'styles/global'
// Fetch and promise polyfill
import 'promise-polyfill'
import 'whatwg-fetch'
// Application
import {render} from 'react-dom'
import {bindWithDispatch} from 'feathers-redux'
import {configureStore, configureRootComponent} from 'common/index.jsx'
import createServices from 'common/feathers/services'

if (process.env.NODE_ENV === 'production') {
  require('common/pwa')
} else if (process.env.NODE_ENV === 'development') {
  // Devtools
  // NOTE: whyDidYouUpdate package is temporary broken, waiting for a patch.

  /*eslint-disable */
  // NOTE: But if you really want to run `why-did-you-update`
  // You can uncomment this block:
  /*
    Object.defineProperty(React, 'createClass', {
      set: nextCreateClass => {
        createClass = nextCreateClass
      }
    })

   const {whyDidYouUpdate} = require('why-did-you-update')
    whyDidYouUpdate(React)
  */
  /*eslint-enable */
  window.Perf = require('react-addons-perf')
}

const preloadedState = window.__PRELOADED_STATE__ || {}
delete window.__PRELOADED_STATE__

const rawServices = createServices()

const store = configureStore(rawServices, preloadedState)
const services = bindWithDispatch(store.dispatch, rawServices)

const RootComponent = configureRootComponent({store, services})
render(RootComponent, document.getElementById('app'))

if (module.hot) {
  module.hot.accept()
}
