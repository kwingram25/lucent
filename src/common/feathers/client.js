import feathers from 'feathers-client'
import createSocket from '../../client/socket.io'

export default function ({url}) {
  console.log(url)
  const socket = createSocket(url)

  const client = feathers()
    .configure(feathers.hooks())
    .configure(feathers.socketio(socket))

  return client
}
