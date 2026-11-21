const jwt = require("jsonwebtoken")
const generatetoken = require("../utils/token")

const isloggedin = ((req, res, next)=>{
    if(!req.cookies.token){
        return res.redirect("/login")
    }
})