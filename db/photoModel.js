const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Comment.
 */
const commentSchema = new mongoose.Schema({
  comment: String,
  date_time: { type: Date, default: Date.now },

  // phải đặt tên là "user", không phải "user_id"
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});


/**
 * Define the Mongoose Schema for a Photo.
 */
const photoSchema = new mongoose.Schema({
  file_name: String,
  date_time: { type: Date, default: Date.now },

  // ref tới User
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  comments: [commentSchema]
});


/**
 * Create a Mongoose Model for a Photo using the photoSchema.
 */
const Photo = mongoose.model.Photos || mongoose.model("Photos", photoSchema);

/**
 * Make this available to our application.
 */
module.exports = Photo;
