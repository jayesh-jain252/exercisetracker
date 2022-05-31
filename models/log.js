const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: Array,
});

logSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Log", logSchema);
