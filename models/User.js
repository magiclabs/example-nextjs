const mongoose = require("mongoose");
const Todo = require("./Todo");

const Schema = mongoose.Schema;

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

module.exports = mongoose.models?.User || mongoose.model("User", UserSchema);
