const mongoose = require("mongoose")
const userModel = require("../models/users")
const bcrypt = require("bcrypt")
const generatetoken = require("../utils/token")

const registerUser = async(req, res) => {
    let {name, email, password} = req.body
    let user = await userModel.findOne({email})

    if(user) return res.send("user already exist")

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async(err, hash)=>{
            const user = await userModel.create({
            name,
            email,
            password: hash
        })
        const token = generatetoken(user)
        res.cookie("token", token)
        res.json(user)
    
        })
    })
    
}

const loginUser = async(req, res) => {
    let {email, password} = req.body

    let user = await userModel.findOne({email})

    if(!user) return res.send("user doesnt exist")

    bcrypt.compare(password, user.password, (err, result) => {
        if(err) return res.send("Something went wrong")

        if(result) {
            let token = generatetoken(user)

            res.cookie("token", token, 
                
            )

            return res.redirect("/shop")
        }
        else {
            return res.send("Wrong password")
        }
    })
}

const logoutuser = (req, res)=>{
    res.cookie("")
    return(
        res.redirect(`${process.env.frontend}/`)
    )
}

module.exports = { registerUser, loginUser, logoutuser }