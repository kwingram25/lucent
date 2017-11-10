import {combineReducers} from 'redux'
import {routerReducer} from 'react-router-redux'

import {layout} from './layout'
import {posts} from './posts'
import {users} from './users'
import {auth} from './auth'
import {intl} from './intl'

// Root reducer
export default function (reduxifiedServices) {
  return combineReducers({
    layout,
    intl,
    me: combineReducers({auth}),
    entities: combineReducers({
      posts,
      users
    }),
    routing: routerReducer,
    portfolio: reduxifiedServices.portfolio.reducer,
    holdings: reduxifiedServices.holdings.reducer,
    transactions: reduxifiedServices.transactions.reducer,
    currencies: reduxifiedServices.currencies.reducer,
    exchanges: reduxifiedServices.exchanges.reducer

  })
}
