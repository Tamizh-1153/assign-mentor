const express = require("express")
const app = express()
const mongoose = require("mongoose")
require('dotenv').config()
const connectDB=require('./db/connectDB')

const { Student, Mentor } = require("./model")

app.use(express.static("./public"))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Creating a new student
app.post("/students", async (req, res) => {
  try {
    const { name, age } = req.body
    const student = await Student.create({ name, age })

    res.json(student)
  } catch (err) {
    res.json(err)
    console.log(err)
  }
})

// Creating a new Mentor
app.post("/mentors", async (req, res) => {
  try {
    const { name } = req.body
    const mentor = await Mentor.create({ name })
    res.json(mentor)
  } catch (err) {
    console.log(err)
    res.json(err.message)
  }
})

// Assigning mentor to multiple students
app.patch("/assign-Mentor", async (req, res) => {
  try {
    const { mentorName } = req.body
    const { studentNames } = req.body
    const studentNamesArray = studentNames.split(",")

    const mentor = await Mentor.findOne({ name: mentorName })
    const students = await Student.find({ name: { $in: studentNamesArray } })

    students.forEach(async (student) => {
      student.mentor = mentor.name
      mentor.student.push(student.name)
      await student.save()
    })
    await mentor.save()

    res.json("Mentor assigned successfully to the students")
  } catch (err) {
    res.json(err.message)
  }
})
app.get("/assign-Mentor", async (req, res) => {
  try {
    res.json("Mentor assigned successfully to the students")
  } catch (err) {
    res.json(err.message)
  }
})

// Getting all students assigned to a particular mentor
app.get("/mentors/:mentorName/students", async (req, res) => {
  try {
    const { mentorName } = req.params
    const students = await Student.find({ mentor: mentorName })

    res.json(students)
  } catch (err) {
    res.json(err.message)
  }
})

// change mentor to a particular student
app.patch("/students/:studentName/:mentorName", async (req, res) => {
  try {
    const { studentName } = req.params
    const { mentorName } = req.params

    const student = await Student.findOne({ name: studentName })
    const mentor = await Mentor.findOne({ name: mentorName })
    const previousMentor = await Mentor.findOne({ name: student.mentor })

    student.previouslyAssignedMentor = student.mentor
    student.mentor = mentor.name
    await student.save()

    mentor.student.push(student.name)
    await mentor.save()

    previousMentor.student.forEach((student) => {
      if (student == studentName) {
        previousMentor.student.pull(student)
      }
    })
    await previousMentor.save()

    res.json(student)
  } catch (err) {
    res.json(err.message)
  }
})
app.get("/students/:studentName/:mentorName", async (req, res) => {
  try{
    res.send("Mentor changed successfully")
  }catch (err) {
    res.json(err.message)
  }
})

// get previously assigned mentor to a particular student
app.get("/:studentName/PreviousMentor", async (req, res) => {
  try {
    const { studentName } = req.params

    const student = await Student.findOne({ name: studentName })

    if (!student) {
      return res.status(404).json({ error: "Student not found" })
    }

    res.json({ previouslyAssignedMentor: student.previouslyAssignedMentor })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// get all students without mentor
app.get("/allStudents-without-mentor", async (req, res) => {
  try {
    const students = await Student.find({ mentor: null })
    res.json(students)
  } catch (err) {
    res.json(err.message)
  }
})

//get all students
app.get("/allStudents", async (req, res) => {
  try {
    const students = await Student.find({})
    res.json(students)
  } catch (err) {
    res.json(err.message)
  }
})

//get all mentors
app.get("/allMentors", async (req, res) => {
  try {
    const mentors = await Mentor.find({})
    res.json(mentors)
  } catch (err) {
    res.json(err.message)
  }
})

app.patch("/assignMentor", async (req, res) => {
  try {
    const { mentorName } = req.body.mentorName
    console.log(req.body)
  } catch (err) {
    res.json(err.message)
  }
})

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(5000, () => {
      console.log("Server is listening on port 5000...")
    })
  } catch (err) {
    console.log(err)
  }
}
start()
