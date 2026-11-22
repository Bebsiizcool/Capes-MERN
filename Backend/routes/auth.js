const express = require("express")
const router = express.Router()
const {registerUser, loginUser, logoutuser,} = require("../controllers/auth-controller")
const {admin} = require("../controllers/auth-admin")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutuser)
router.post("/adminlogin", admin)


module.exports = router