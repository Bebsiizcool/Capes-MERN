const adminmodel = require("../models/admin")
const generatetoken = require("../utils/admin-token")

const admin = async (req, res) => {
    let { email, password } = req.body

    let admin = adminmodel.findOne({email})
    if(admin) return(
        res.json({
        success: true,
        message: "Admin created successfully"
        
    })
)
    const token = generatetoken(admin)
    res.cookie("token",token)

}

module.exports = { admin }