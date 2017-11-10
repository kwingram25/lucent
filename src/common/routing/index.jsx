import React from 'react'
import {Route} from 'react-router-dom'
import {Users, Dashboard, Login, Portfolio} from 'containers'
import RouteAuth from 'components/addons/RouteAuth'
import {createBrowserHistory, createMemoryHistory} from 'history'

export const history = getHistory()

function getHistory () {
  const basename = ''
  if (process.env.BROWSER !== true) {
    return createMemoryHistory()
  }
  return createBrowserHistory({basename})
}

export function getRoutes (services) {
  const loadLazyComponent = url => {
    return async cb => {
      // NOTE: there isn't any duplication here
      // Read Webpack docs about code-splitting for more info.
      if (process.env.BROWSER) {
        const loadComponent = await import(/* webpackMode: "lazy-once", webpackChunkName: "lazy-containers" */ `containers/${url}/index.jsx`)
        return loadComponent
      }
      const loadComponent = await import(/* webpackMode: "eager", webpackChunkName: "lazy-containers" */ `containers/${url}/index.jsx`)
      return loadComponent
    }
  }

  return [
    {
      path: '/',
      exact: true,
      icon: 'line-chart',
      name: 'Portfolio',
      displayName: 'Portfolio',
      sidebarVisible: true,
      tag: Route,
      render: props => <Portfolio key={Math.random()} services={services} {...props} />
    },
    {
      path: '/tokens',
      name: 'Tokens',
      displayName: 'Tokens',
      exact: true,
      icon: 'book',
      sidebarVisible: true,
      tag: Route,
      render: props => <div></div>
    },
    {
      path: '/arbitrage',
      name: 'Arbitrage',
      displayName: 'Arbitrage',
      exact: true,
      icon: 'swap',
      sidebarVisible: true,
      tag: Route,
      render: props => <div></div>
    },
    {
      path: '/api-keys',
      name: 'API Keys',
      displayName: 'API Keys',
      exact: true,
      icon: 'key',
      sidebarVisible: true,
      tag: Route,
      render: props => <div></div>
    },
    {
      path: '/auth',
      name: 'Auth',
      tag: Route,
      component: Login
    },
    {
      path: '/users/:id',
      name: 'User',
      lazy: true,
      exact: true,
      tag: RouteAuth,
      component: loadLazyComponent('UserItem'),
      passProps: {
        services
      }
    }
  ]
}
