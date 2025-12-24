const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const session = require("express-session");

router.post("/login", async (req, res) => {
    const {login_name, password} = req.body;
    if(!login_name || !password){
        return res.status(400).json({error: "Login name and password are required!"});
    }

    try {
        const user = await User.findOne({login_name});
        if(!user){
            return res.status(400).json({error: "Login name does not exists."});
        }
        if(user.password !== password){
            return res.status(400).json({error: "Login name or password is wrong."});
        }
        req.session.user = user;
        res.status(200).json(req.session.user);

    } catch(e){
        return res.status(400).json({error: "Server error"});
    }
})

router.post("/logout", async (req, res) => {
    if(!req.session.user){
        return res.status(400).json({error: "No user logged in."});
    }
    req.session.destroy((err) => {
        if(err){
            return res.status(400).json({error: "Failed to logout."});
        }
        res.status(200).json({message: "Logged out."});
    })
})

router.get("/checklogin", async (req, res) => {
    if(req.session && req.session.user){
        return res.status(200).json(req.session.user);
    }
    return res.status(400).json({error: "No user logged in."});
})


module.exports = router;