const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("User", userSchema);
