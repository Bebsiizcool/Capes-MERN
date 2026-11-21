const express = require("express")
const router = express.Router()
const {registerUser, loginUser, logoutuser} = require("../controllers/auth-controller")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutuser)

module.exports = router