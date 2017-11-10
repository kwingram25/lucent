import feathers from 'feathers'
import config from './express'
import api from './feathers'
// import API from './api'
import useSSR from './ssr'
import chalk from 'chalk'

const app = feathers()
app.configure(config)

const {BASE_API, PORT} = process.env
// Add API route
app.use(BASE_API, api)
// Add SSR handler
app.use(useSSR)
// Start server
const server = app.listen(PORT, () => {
  console.log(chalk.magenta(`\nServer is running on ${PORT} port!\n`))
})
api.setup(server)
