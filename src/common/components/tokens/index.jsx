const tryRequireTokenImage = ({imageId}) => require(`static/images/tokens/64x64/${imageId}.png`)

const getTokenImage = ({imageId}) => {
  try {
    return tryRequireTokenImage({imageId})
  } catch (e) {
    console.log(e)
    return false
  }
}

module.exports = {
  getTokenImage
}
