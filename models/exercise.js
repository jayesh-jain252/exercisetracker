const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  username: String,
  date: Date,
  duration: Number,
  description: String,
});

exerciseSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Exercise", exerciseSchema);
