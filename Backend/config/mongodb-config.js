const mongoose = require("mongoose")

mongoose.connect(`${process.env.mongoconnection}/capes`)
.then(()=>{
    console.log("mongodb connection successfull")
})
.catch((err)=>{
    console.log("not connected", err)
})

module.exports = mongoose.connection