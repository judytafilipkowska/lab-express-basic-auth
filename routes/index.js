const router = require("express").Router();
const isLoggedIn = require("../middleware/isLoggedIn")
/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});


router.get("/main", isLoggedIn, (req, res) => {
  res.render("main-view")
})

router.get("/private", isLoggedIn, (req, res) => {
  res.render("private-view")
})
module.exports = router;
