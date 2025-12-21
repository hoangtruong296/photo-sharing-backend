const express = require("express");
const User = require("../db/userModel");
const router = express.Router();


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

router.post("/newuser", async (req, res) => {
    const { first_name,
            last_name,
            login_name,
            password,
            location,
            description,
            occupation } = req.body;
    if(!login_name || !password){
        return res.status(400).json({error: "Login name and password are required"});
    }
    if(!first_name || !last_name){
        return res.status(400).json({error: "First name and last name are required"});
    }
    const exist_user = await User.findOne({login_name});
    if(exist_user){
        return res.status(400).json({error: "Login name is already exists."});
    }
    const user = new User({
        first_name,
        last_name,
        login_name,
        password,
        location,
        description,
        occupation
    });
    await user.save();

    res.status(200).json({
        _id: user._id, 
        login_name: user.login_name,
        first_name: user.first_name,
        last_name: user.last_name
    });
});

module.exports = router;