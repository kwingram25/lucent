import feathers from 'feathers'
import configuration from 'feathers-configuration'
import hooks from 'feathers-hooks'
import rest from 'feathers-rest'
import reduxifyServices, { getServicesStatus } from 'feathers-redux'

import middleware from './middleware'
import services from './services'
import appHooks from './app.hooks'
import socketio from './socket.io'

import express from '../express'
import mongoose from '../mongoose'

import { syncCurrencies } from './populate'

// Initialize the Express App
const app = feathers()

app.configure(configuration())
// Set up Plugins and providers
app.configure(hooks())
app.configure(rest())

app.configure(express)
app.configure(mongoose)
app.configure(socketio)

app.configure(middleware)
app.configure(services)

app.configure(syncCurrencies)

export default app
