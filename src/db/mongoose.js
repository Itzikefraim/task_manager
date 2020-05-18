const mongoose = require('mongoose')
const md5 = require('md5')

const connectionURL = 'mongodb+srv://Itzikefraim:Itzik170295@cluster0-ruhul.gcp.mongodb.net/task-manager-api?retryWrites=true&w=majority'    //'mongodb://127.0.0.1:27017' // connect to local mongodb

mongoose.connect(connectionURL, {
  useNewUrlParser: true,
  useCreateIndex:true,
  useUnifiedTopology: true,
  useFindAndModify: false
}).catch((error) => {
  console.log(error)
})




// const task = new Task({
//   description: 'stats hw',
//   completed: false
// })
//
// task.save().then((data) => {
//   console.log(data)
// }).catch((err) => {
//   console.log(err)
// })

// const me = new User({
//   name: 'nir',
//   email: 'nir@gmail.com',
//   password: 12,
//   age: 19
// })
//
// me.save().then((data) => {
//   console.log(data)
//
// }).catch((error, ) => {
//   console.log('err',error )
// })
