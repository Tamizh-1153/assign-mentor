const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  mentor: {
    type: mongoose.SchemaTypes.String,
    ref: "Mentor",
  },
  previouslyAssignedMentor: {
    type: mongoose.SchemaTypes.String,
    ref: "Mentor",
  },
})

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  student: [
    {
      type: mongoose.SchemaTypes.String,
      ref: "Student",
    },
  ],
})

const Student = mongoose.model("Student", studentSchema)
const Mentor = mongoose.model("Mentor", mentorSchema)

module.exports = { Student, Mentor }
