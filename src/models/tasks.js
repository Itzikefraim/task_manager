const mongoose = require('mongoose')


const TaskSchema = new mongoose.Schema({
  description: {
    type: String,
    trim: true,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // should be typed exactly like in the mongoose.model in the user model
  }
}, {timestamps: true})

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task
