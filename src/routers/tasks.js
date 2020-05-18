const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/tasks')

/**
These are the endpoints for the task objest:
get all
get one by id
remove one by id
update one by id
post a new user

**/


router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    // finds a task that is owned by the requster and deletes it
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }

    res.send(task)
  } catch (err) {
    res.status(500).send(err)

  }

})

router.post('/tasks', auth, async (req, res) => {
const task = new Task({
  ...req.body, // copies all req.body properties to task object
  owner: req.user._id // creates the relations between the task and the owner
})

  try {
    await task.save()
    res.status(201).send(task)
  } catch(err) {
    res.status(400).send(error)
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id // fetches the id we need

  try {
    const task = await Task.findOne({ _id, owner: req.user._id }) // making sure the user can only get it's own tasks

    if (!task) {
      return res.status(404).send()
    }
    res.send(task)

  } catch(err) {
    res.status(500).send()

  }
})

// /tasks?completed=true in the url will return all tasks that completed equals true
// /tasks?limit=10&skip=0 // return 10 results in first page. skip=1 will go to second page and so on
// tasks?sortBy=createdAt:asc // sort result in ascending. if want by descending replace asc with desc
router.get('/tasks', auth, async (req, res) => {
  // to use inside filter
  const match = {}
  // take string from postman if exists and put in match
  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  // sorting object
  const sort = {

  }

  // if url has sortBy
  if (req.query.sortBy) {
    // splits the url to 2 parts, before and after : we can also use _ instead of :
    const parts = req.query.sortBy.split(":")
    // takes the first part (field that we want to sort by) of url and adds it as a field to object sort,
    // then setting its value to either 1 ascending or -1 descending
    sort[parts[0]] =  part[1] === 'desc' ? -1 : 1
  }

  try {
    // const tasks = await Task.find({ owner: req.user._id}) // only returns tasks that belongs to that user
    // // does the same as line commented above
    // await req.user.populate('tasks').execPopulate()
    // filter data
     await req.user.populate({
       path: 'tasks',
       match, // takes match object from above
       // pagination(divide pages with max results and page number) and sort
       options: {
         limit: parseInt(req.query.limit),
         skip: parseInt(req.query.skip),
         sort // takes sort object from above
       }
     }).execPopulate()
    res.send(req.user.tasks)
  } catch (err) {
      req.status(500).send(err)
  }
})



router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates'})
  }

  try {
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id })// finds the task in the db and makes it is owned by the requester



    if (!task) {
      return res.status(404).send()
    }

    updates.forEach((update) => task[update] = req.body[update]) // goes through all the updates the user wishes to make
    await task.save() // uploads changes

    res.send(task)
  } catch (err) {
    res.status(400).send(err)

  }
})

module.exports = router
