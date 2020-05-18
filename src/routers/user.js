const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer') // proccesing files from user
const sharp = require('sharp') // editing images
const path = require('path')

/**
These are the endpoints for the user objest:
get all
get one by id
remove one by id
update one by id
post a new user
login

**/
// console.log(__dirname + '\\..\\..\\views\\login.html')
router.post('/users/login', async (req, res) => {
  try {
    // a function we made in user.js in models files
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    // res.sendFile(path.join('C:\\Users\\itzik\\Desktop\\nodejs\\task-manager\\views\\login.html'))

    // if user was found send it
    res.send({ user, token })
  } catch (err) {
    res.status(400).send()
  }
})

// connects to the file users in atlas (we connected to atlas through mongoose.js)
// adds information to db
// an endpoint to create a new user
router.post('/users', async (req, res) => {
 const user = new User(req.body) // gets the pbject from the user and save it

 //sends back the user created and change status to Created
 try {
   // saves user in database
   await user.save()
   const token = user.generateAuthToken()
   res.status(201).send({user, token})
 // sends the error and shows the error code
 } catch (err) {
   res.status(400).send(err)
 }
})

// logout only from one session
router.post('/users/logout', auth, async (req, res) => {

  try {
    // goes through the user's token array and it finds the token provided it
    // deletes it. that way the user doesn't have access anymore, therefor loggedout
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    // save changes
    await req.user.save()

    res.send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
})

// logout all
router.post('/users/logoutAll', auth, async (req, res) => {

  try {
    // empty out the tokens array
    req.user.tokens = []
    // save changes
    await req.user.save()

    res.send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
})


// reads data from the db
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user) // user get its own data
})



router.delete('/users/me', auth, async (req, res) => {
  try {
     // req.user is being passed in middleware
     // remove() removes the user from the database
    await req.user.remove()
    res.send(req.user)
  } catch(err){
      res.status(500).send(err)
  }
})


// update a use by id
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates'})
  }


  try {
    updates.forEach((update) => req.user[update] = req.body[update]) // goes through all the updates the user wishes to make
    await req.user.save() // uploads changes

    res.send(req.user)
  } catch(err) {
    res.status(400).send(err)
  }
})

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg | jpeg | png)$/)){
      cb(new Error('Please upload an image file (jpg, jpeg, or png)'))
    }

    cb(undefined, true)
  }
})

// avatar will be the key in postman. upload.single will look for a file named avatar
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  // editing the image we got from the user
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

  // takes the file buffer and store it in user.avatar
  req.user.avatar = buffer
  // saves to db
  await req.user.save()
  res.send()
}, (error, req, res, next) => { // error handaling call back
  res.status(400).send({error: error.message})
})

// delete avatar
router.delete('/user/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.status(200).send()
})

// get the avatar of a specific user
router.get('/users/"id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error()
    }

    // sets the type of data we send back
    res.set('Content-Type', 'image/png')
    // sends the code of the picture (stored in user.avatar)
    res.send(user.avatar)

  } catch (err) {
    res.status(404).send()
  }
})
module.exports = router
