const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 20,
    trim: true // trims all white space
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate(value) {
      if (value.includes('password')) {
        throw new Error('password is not allowed to be included in your password')
      }
    }
  },
  email: {
    unique: true,
    type: String,
    required: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is not valid')
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number')
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true // adds two fields: time created and time updated
})

//virtual property (realationship)
userSchema.virtual('tasks',{
  ref: 'Task',
  localField: '_id', // the user's _id is the relationship between the user and the task
  foreignField: 'owner' // name of the field on the task that creates the relationship. we called it owner in the task models
})

// middleware function
// statics is for letting us access this function from other files
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email }) // looking for the user by email

  // if user wasnt found throw an error
  if (!user) {
    throw new Error('Unable to login')
  }

  // if user was found, checks if password provided is the same password that
  // is in our database
  const isMatch = await bcrypt.compare(password, user.password)

  //if password doesnt match throw an error
  if (!isMatch) {
    throw new Error('Unable to login')
  }

  //if everything mathces returns user
  return user
}


userSchema.methods.generateAuthToken = async function () {
  const user = this
  // generates token
  const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')

  // connect token to the use instance
  user.tokens = user.tokens.concat({ token })
  // uploads to the databse
  await user.save()

  return token
}

// a function to return a user object without details that should be safe
// every time we send a user object back in the routers this function is being called
userSchema.methods.toJSON =  function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}

// a middleware function to perform things right after the user was created
// and right before the use is getting saved in the db
userSchema.pre('save', async function (next) {
  const user = this // the new user that is being created

  // hashing the password and changing the password value for user
  // if password hasn't been hashed before (in case of an update request the user makes)
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)  // 8 stands for how many rounds of hashing
  }

  next() // when we are done with middleware
})

// a middleware for deleting your own account.
// right before it gets deleted, this function deletes all
// it's tasks from the database
userSchema.pre('remove', async function (next) {
  const user = this
  await Task.deleteMany({ owner: user._id })

  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
