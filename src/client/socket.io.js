import io from 'socket.io-client'

export default function (url) {
  const socket = url
    ? io(url)
    : process.env.NODE_ENV === 'development'
      ? io(':4000')
      : io()

  return socket
}
