const mongoose = require("mongoose");
const Todo = require("./Todo");

const Schema = mongoose.Schema;

// include this to avoid error: OverwriteModelError: Cannot overwrite `User` model once compiled.
delete mongoose.connection.models["User"];

const UserSchema = new Schema({
  email: { type: String, required: true },
  issuer: { type: String, required: true, unique: true }, // did:ethr:public_address
  todos: [
    {
      type: Schema.Types.ObjectId,
      ref: Todo
    }
  ]
});

module.exports = mongoose.model("User", UserSchema);
