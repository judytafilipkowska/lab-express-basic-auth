const router = require("express").Router();
const User = require("./../models/User.model")
const bcrypt = require("bcryptjs");
const isLoggedIn = require("./../middleware/isLoggedIn")

const saltRounds = 10;

router.get("/signup", (req, res) => {
    res.render("auth/signup-form");
});

router.post("/signup", (req, res) => {
    const {username, password} = req.body;

    const usernameNotProvided =!username || username === "";
    const passwordNotProvided =!password || password === "";

    if (usernameNotProvided || passwordNotProvided) {
        res.render("auth/signup-form", { errorMessage: "Provide username and password"});
        return;
    }

    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

    if(!regex.test(password)) {
        res.status(400).render("auth/signup-form", {
            errorMessage:  "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter."
        });
        return
    }

    User.findOne({username: username})
        .then((foundUser) => {
            if (foundUser) {
                throw new Error ("The username is taken");
            }
            return bcrypt.genSalt(saltRounds);  
        })
        .then ((salt) => {
            return bcrypt.hash(password, salt);
        })
        .then((hashedPassword) => {
            return User.create ({username: username, password: hashedPassword})
        })
        .then((createdUser) => {
            res.redirect("/");
        })
        .catch((err) => {
            res.render("auth/signup-form", {errorMessage: err.message || "Error while trying to sign up"})
        })
});

router.get("/login", (req, res) => {
    res.render("auth/login-form")
})

router.post("/login", (req, res) => {
    const {username, password} = req.body;

    const usernameNotProvided =!username || username === "";
    const passwordNotProvided =!password || password === ""; 

    if (usernameNotProvided || passwordNotProvided) {
        res.render("auth/login-form", { errorMessage: "Provide username and password"});
        return;
    }  
    let user;

    User.findOne({ username: username })
        .then((foundUser) => {
            user = foundUser;
            
            if(!foundUser) {
                throw new Error ("Wrong credentials provided");
            }
            return bcrypt.compare(password, foundUser.password)
        })
        .then((isPassCorrect) => {
            if (!isPassCorrect) {
                throw new Error("Wrong credentials provided")
            } else if (isPassCorrect) {
                req.session.user = user;
                res.redirect("/")
            }
        })
        .catch((err) => {
            res.render("auth/login-form", {errorMessage: err.message || 'Provide username and password'})
        })
})

router.get("/logout",isLoggedIn, (req, res) => {
    req.session.destory((err) => {
        if (err) {
            return res.render("error")
        }        
        res.redirect|("/")
    })
})
module.exports = router;