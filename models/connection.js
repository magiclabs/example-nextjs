import Mongoose from "mongoose";

function dbConnect() {
  if (Mongoose.connection.readyState === 0) {
    Mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
}

dbConnect();

export default dbConnect;
