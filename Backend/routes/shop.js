
const express = require("express")
const router = express.Router()
const isloggedin = require("../middlewares/isloggedin")

router.get("/", isloggedin, (req, res) => {
    res.status(200).json({ message: "Welcome to shop" })
})

module.exports = router
