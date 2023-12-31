const express = require('express')
const app = express()
const path = require('path')

app.use(express.json())

let Rollbar = require('rollbar')
let rollbar = new Rollbar({
  accessToken: 'f9f890690f594170ad5797fd94953b5e',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

rollbar.log('Hello world!')

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    res.status(200).send(students)
    rollbar.log('student list sent', students)
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
           students.push(name)
           rollbar.info('new student added')
           res.status(200).send(students)
       } else if (name === ''){
        rollbar.critical('attempted empty name')
           res.status(400).send('You must enter a name.')
       } else {
        rollbar.error('attempted duplicate student')
           res.status(400).send('That student already exists.')
       }
   } catch (err) {
        rollbar.error(err)
       console.log(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    res.status(200).send(students)
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
