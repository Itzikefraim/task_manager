const express = require('express') // server
require('./db/mongoose') // make sure the file runs and connect to db
const userRouter = require('./routers/user')
const taskRouter = require('./routers/tasks')
const path = require('path')


const app = express() // creates the server

const port = process.env.PORT || 5000 // gets the port from horaku

// // file uploading package
// const multer = require('multer')
// const upload = multer({
//   dest: 'images',
//   limits: {
//     fileSize: 1000000 // one megabyte, a million bytes max size for the file
//   },
//   // function to validate the file
//   fileFilter(req, file, cb) {
//     // regular expression to only accept files that end with doc or docx extention.
//     // regex101.com
//     if (!file.originalname.match(/\.(doc | docx)$/)) {
//       return cd(new Error('Please upload a word document'))
//     }
//
//     cb(undefined, true);
//
//     // cb(new Error('File must be a PDF')) // error
//     // cb(undefined, true) // no error, file accepted
//     // cb(undefined, false) // no error, file not accepted
//   }
// })

// // end point
// app.post('/upload', upload.single('upload'), (req, res) => {
//   res.send()
// })


app.use(express.json()) // middleware function that translates the objects to json file
app.use(userRouter) // gets the routers from the user file
app.use(taskRouter)

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname + '/../html/login.html'))
// })


app.listen(port, () => {
  console.log('Server is up on port ' + port)
})
