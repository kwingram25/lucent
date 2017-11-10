import URL from 'url'
import React from 'react'
// Redux stuff
import thunk from 'redux-thunk'
import {createStore, applyMiddleware, compose} from 'redux'
import {routerMiddleware} from 'react-router-redux'
import reduxPromiseMiddleware from 'redux-promise-middleware'
import io from 'socket.io-client'
import feathers from 'feathers-client'
// Application
import rootReducer from 'reducers'
import {Root} from 'components'
import {getRoutes, history} from 'routing'
import startRealtime from 'common/feathers/realtime'

const { BASE_API } = process.env

/**
 * Configure application store with middlewares.
 * @param  {Object} initialState - preloadedState
 * @return {Object} - configured store
 */
export const configureStore = (reduxifiedServices, initialState) => {
  // const thunkApplied = applyMiddleware(thunk)
  // const routerMiddlewareApplied = applyMiddleware(routerMiddleware(history))
  // const promiseMiddlewareApplied = applyMiddleware(reduxPromiseMiddleware())
  let enhancers = (
    process.env.NODE_ENV === 'development'
      ? require('redux-devtools-extension').composeWithDevTools
      : compose
  )(
    applyMiddleware(...[
      thunk,
      routerMiddleware(history),
      reduxPromiseMiddleware()
      // process.env.NODE_ENV === 'development' && window.devToolsExtension
      //   ? window.devToolsExtension()
      //   : f => f
    ])
  )

  // if (process.env.NODE_ENV === 'development') {
  //   const {composeWithDevTools} = require('redux-devtools-extension')
  //   enhancers = composeWithDevTools(thunkApplied, promiseMiddlewareApplied, routerMiddlewareApplied)
  // } else {
  //   enhancers = compose(thunkApplied, promiseMiddlewareApplied, routerMiddlewareApplied)
  // }

  // console.log(reduxifiedServices)

  return createStore(rootReducer(reduxifiedServices), initialState, enhancers)
}
/* eslint-disable */
export const configureRootComponent = ({store, SSR, services, url}) => {
  // stupid eslint thinks that if function returns JSX, than it's a component
  // "Eslint, I don't want a component, I want a function!"

  // if (SSR.location) {
  //   console.log((new URL(SSR.location)).host)
  // }
  //
  // const client = feathers()
  //   .configure(feathers.hooks())
  //   .configure(feathers.socketio(
  //     process.env.NODE_ENV === 'development'
  //     ? io(':4000')
  //     : SSR.location
  //     ? io((new URL(SSR.location)).host)
  //     : io()
  //   ))
  const routes = getRoutes(services)
  // const realtime = startRealtime(client, services, ['portfolio', 'holdings', 'transactions'].map(n => `${BASE_API}/${n}`))

  const propsRoot = {
    services,
    routes,
    history,
    store,
    SSR,
    url
  }

  return <Root {...propsRoot} />
}
/* eslint-enable */
