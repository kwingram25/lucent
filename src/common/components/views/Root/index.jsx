import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Provider} from 'react-redux'
import {APPLICATION_INIT} from 'actions'
import {ThemeProvider} from 'styled-components'
import { LocaleProvider } from 'antd'
import enUS from 'antd/lib/locale-provider/en_US'

import theme from 'styles/theme'
import App from 'containers/App'
import Intl from 'components/addons/Intl'
import RoutingWrapper from 'components/addons/RoutingWrapper'
import createClient from 'common/feathers/client'
import startRealtime from 'common/feathers/realtime'

const Router =
 process.env.BROWSER === true
   ? require('react-router-redux').ConnectedRouter
   : require('react-router').StaticRouter

export default class Root extends Component {
 static propTypes = {
   store: PropTypes.object,
   SSR: PropTypes.object,
   url: PropTypes.string,
   history: PropTypes.object,
   routes: PropTypes.array,
   services: PropTypes.object,
   client: PropTypes.object
 }

 static defaultProps = {
   SSR: {}
 }

 componentWillMount () {
   const {store, services, url} = this.props
   const {BASE_API} = process.env

   console.log(url)
   const client = createClient({url: url || undefined})

   startRealtime(client, services, ['portfolio', 'holdings', 'transactions', 'exchanges'].map(n => `${BASE_API}/${n}`))

   store.dispatch({type: APPLICATION_INIT})
 }

 render () {
   const {SSR, store, history, routes} = this.props
   const routerProps =
   process.env.BROWSER === true
     ? {history}
     : {location: SSR.location, context: SSR.context}

   // key={Math.random()} = hack for HMR from https://github.com/webpack/webpack-dev-server/issues/395
   return (
     <Provider store={store} key={Math.random()}>
       <Intl>
         <LocaleProvider locale={enUS}>
           <ThemeProvider theme={theme}>
             <Router {...routerProps} key={Math.random()}>
               <App routes={routes}>
                 <RoutingWrapper store={store} routes={routes} />
               </App>
             </Router>
           </ThemeProvider>
         </LocaleProvider>
       </Intl>
     </Provider>
   )
 }
}
