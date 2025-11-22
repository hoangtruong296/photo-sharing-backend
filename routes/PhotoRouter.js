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
    const photos = await Photo.find({ user_id: id })
      .populate({
        path: "comments.user_id",
        select: "_id first_name last_name"
      })
      .exec();

    const result = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: photo.comments.map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: c.user_id     // ⚡ vì populate đã biến user_id -> object User
          ? {
              _id: c.user_id._id,
              first_name: c.user_id.first_name,
              last_name: c.user_id.last_name
            }
          : null
      }))
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
