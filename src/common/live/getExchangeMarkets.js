const { markets } = require('../../server/remote/endpoints')()

export default async function ({exchange, base}) {
  const results = await markets.get({exchange, base})
  return results
}
