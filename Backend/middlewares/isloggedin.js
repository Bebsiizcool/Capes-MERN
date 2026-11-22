const jwt = require("jsonwebtoken")

const isloggedin = (req, res, next) => {

    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Please login first"
        })
    }

    try {
        const data = jwt.verify(token, process.env.JWT_TOKEN)
        req.user = data
        next()
    } catch (err) {
        res.clearCookie("token")
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}

module.exports = isloggedin