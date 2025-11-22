const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// router.post("/", async (request, response) => {
  
// });

router.get("/list", async (req, res) => {
    try {
        const users = await User.find({}, "_id first_name last_name"); 
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findById(
            id,
            "_id first_name last_name location description occupation"
        );

        if (!user) return res.status(400).json({ error: "Not found" });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: "Not found" });
    }
});


module.exports = router;