const mongoose = require("mongoose")

const adminModel = mongoose.Schema({
   
    email: {
        value: String,
        required: true
    },

    password: {
        value: String,
        required: true
    }
})

module.exports = mongoose.model("admin", adminModel)