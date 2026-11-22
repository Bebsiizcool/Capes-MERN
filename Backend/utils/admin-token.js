const jwt = require("jsonwebtoken")

const generatetoken = ((admin)=>{
    return jwt.sign(
        {email: admin.email},
        process.env.JWT_ADMIN
    )
})

module.exports = generatetoken