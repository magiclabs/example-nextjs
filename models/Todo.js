const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// include this to avoid error: OverwriteModelError: Cannot overwrite `Todo` model once compiled.
delete mongoose.connection.models["Todo"];

const TodoSchema = new Schema({
  todo: { type: String, required: true },
  completed: Boolean
});

module.exports = mongoose.model("Todo", TodoSchema);
