const adminmodel = require("../models/admin")

const admin = async (req, res) => {
    let { email, password } = req.body

    await adminmodel.create({
        email,
        password
    })

    res.json({
    success: true,
    message: "Admin created successfully"
})
}

module.exports = { admin }