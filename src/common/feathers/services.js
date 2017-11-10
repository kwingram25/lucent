import reduxifyServices from 'feathers-redux'
import createClient from './client'

export default function (clientOptions = {}) {
  const { BASE_API } = process.env

  console.log(clientOptions)
  const client = createClient(clientOptions)

  const serviceNames = ['portfolio', 'holdings', 'transactions', 'currencies', 'exchanges']

  // Initialize store
  const rawServices = reduxifyServices(client, serviceNames
    .map(s => `${BASE_API}/${s}`))

  serviceNames.forEach(s => {
    rawServices[s] = rawServices[`${BASE_API}/${s}`]
    delete rawServices[`${BASE_API}/${s}`]
  })

  return rawServices
}
