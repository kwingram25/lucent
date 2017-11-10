import Realtime from 'feathers-offline-realtime'

export default function (client, services, serviceNames = [], options = {}) {
  const { BASE_API } = process.env
  const presets = {

    [`${BASE_API}/portfolio`]: {
      query: {
        demo: true
      },
      subscriber: rt => (records, last) => {
        const { connected } = rt
        let {action, eventName, source, record} = last

        switch (eventName) {
          case 'patched':
            const { value, history, period, groupBy } = record
            records = Object.assign(records, {value, history, period, groupBy})
            break

          case 'created':
          default:
            break
        }

        console.log(`.replicator event. action=${action} eventName=${eventName} source=${source}`, record)
        services.portfolio.store({ connected, last, records })
      }
    },

    [`${BASE_API}/holdings`]: {
      subscriber: rt => (records, last) => {
        const { connected } = rt
        let {action, eventName, source, record} = last

        switch (eventName) {
          case 'patched':
            const { value, index, groupIndex } = record
            records = records.map(h => record._id === h._id ? Object.assign(h, {value, index, groupIndex}) : h)
            break

          case 'created':

            break

          default:
            break
        }
        console.log(`.replicator event. action=${action} eventName=${eventName} source=${source}`, record)
        services.holdings.store({ connected, last, records })
      }
    },

    [`${BASE_API}/transactions`]: {
      query: {
        $sort: {
          date: 1
        }
      },
      sort: Realtime.multiSort({date: -1}),
      subscriber: rt => (records, last) => {
        const { connected } = rt
        let {action, eventName, source, record} = last

        console.log(`.replicator event. action=${action} eventName=${eventName} source=${source}`, record)
        services.transactions.store({ connected, last, records })
      }
    },

    [`${BASE_API}/exchanges`]: {
      sort: Realtime.multiSort({name: -1}),
      subscriber: rt => (records, last) => {
        const { connected } = rt
        let {action, eventName, source, record} = last

        console.log(`.replicator event. action=${action} eventName=${eventName} source=${source}`, record)
        services.transactions.store({ connected, last, records })
      }
    }
  }

  const realtime = {}
  serviceNames.forEach(service => {
    console.log(service)
    const { subscriber, ...opts } = Object.assign(presets[service], options[service] || {})

    const newRealtime = new Realtime(
      client.service(`/${service}`),
      {
        ...opts
      }
    )

    newRealtime.on('events', presets[service].subscriber(newRealtime))
    newRealtime.connect().then(() => console.log(`Realtime ${service} started`))
    realtime[service] = newRealtime
  })

  return realtime
}
