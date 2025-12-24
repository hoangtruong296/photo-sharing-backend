const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();
const fs = require("fs");
const path = require("path");

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
        user: c.user_id     
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

router.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  const {comment} = req.body;
  if(!comment || comment.trim() === ""){
    return res.status(400).json({error: "Emty comment."});
  }
  const photo_id = req.params.photo_id;
  try {
    const photo = await Photo.findById(photo_id);
    if(!photo){
      return res.status(400).json({error: "Photo does not exist."});
    }
    photo.comments.push({
      comment: comment,
      date_time: new Date(),
      user_id: req.session.user._id
    })
    await photo.save();
    res.status(200).json(photo);
  } catch(e){
    res.status(400).json({error: "Failed to comment."});
  }
})

router.delete("/:photoId", async (req, res) => {
  const photo_id = req.params.photoId;
  try {
    const photo = await Photo.findById(photo_id);
    if(!photo){
      return res.status(400).json({error: "Photo does not exist."});
    }

    const imagePath = path.join(__dirname, "..", "images", photo.file_name);

    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Failed to delete image file:", err);
      }
    });

    await Photo.findByIdAndDelete(photo_id);
    res.status(200).json({message: "Photo deleted."});  
  } catch (e){
    res.status(400).json({error: "Server error."})
  }
})

router.delete("/:photoId/comment/:commentId", async (req, res) => {
  const {photoId, commentId} = req.params;
  try {
    const photo = await Photo.findById(photoId);
    if(!photo){
      return res.status(400).json({error: "Photo does not exist."});
    }
    const comment = photo.comments.id(commentId);
    if(!comment){
      return res.status(400).json({error: "Comment does not exist."});
    }
    // if (comment.user.toString() !== req.session.user._id) {
    //   return res.status(403).send("Not authorized");
    // }
    comment.deleteOne();
    await photo.save();
    res.status(200).json({message: "Comment deleted."});  
  } catch (e){
    res.status(400).json({error: "Server error."})
  }
})

const multer = require("multer");
const imagesDir = path.join(__dirname, "..", "images");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = file.originalname;
      // Date.now() + "-" + Math.round(Math.random() * 1e9) +
      // path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
router.post("/new", upload.single("photo"), async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const photo = new Photo({
      file_name: req.file.filename,
      user_id: req.session.user._id,
      date_time: new Date(),
      comments: [],
    });

    await photo.save();
    res.status(200).json(photo);
  } catch (e) {
    res.status(400).json({ error: "Failed to upload photo" });
  }
});

module.exports = router;
