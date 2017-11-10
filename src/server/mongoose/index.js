import mongoose from 'mongoose'

const { MONGO_URL } = process.env

module.exports = function () {
  const app = this
  // // Import required modules

  // import posts from './routes/post.routes';
  // import dummyData from './dummyData';
  // Set native promises as mongoose promise
  mongoose.Promise = global.Promise

  // MongoDB Connection
  mongoose.connect(MONGO_URL || 'mongodb://localhost:27017/lucent', (error) => {
    if (error) {
      console.error('Please make sure Mongodb is installed and running!') // eslint-disable-line no-console
      throw error
    }
  })

  app.set('mongooseClient', mongoose)
}
