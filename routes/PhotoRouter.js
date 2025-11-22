const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();

/**
 * GET /photosOfUser/:id
 * Trả về toàn bộ ảnh của user + comments
 */
router.get("/photosOfUser/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Fetch photos and populate comment users
    const photos = await Photo.find({ user_id: id })
      .populate({
        path: "comments.user",
        select: "_id first_name last_name"
      })
      .exec();

    if (!photos) {
      return res.status(400).json({ error: "User not found or no photos" });
    }

    // Convert Mongoose model -> plain JS objects
    const result = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: photo.comments.map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: c.user
          ? {
              _id: c.user._id,
              first_name: c.user.first_name,
              last_name: c.user.last_name
            }
          : null
      }))
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
