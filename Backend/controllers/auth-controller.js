const mongoose = require("mongoose")
const userModel = require("../models/users")
const bcrypt = require("bcrypt")
const generatetoken = require("../utils/token")

const registerUser = async(req, res) => {
    let {username, email, password} = req.body
    let user = await userModel.findOne({email})

    if(user) return res.send("user already exist")

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async(err, hash)=>{
            const user = await userModel.create({
            username,
            email,
            password: hash
    })
    
    res.cookie("token", token)
    res.json(user)
        })
    })
    
}

const loginUser = async(req, res) => {
    let {username, email, password} = req.body
    let user = await userModel.findOne({email})
    if(!user) return res.send("user doesnt exist")

    
    bcrypt.compare(password, user.password, (err, result)=>{
        if(result === true){
            let token = generatetoken(user)
            res.cookie("token", token)
            return res.send("Login successful")
        }
    })
}

const logout = ()=>{
    return(
        res.cookie("")
    )
}

module.exports = { registerUser, loginUser }