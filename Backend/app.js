require("dotenv").config()
const express = require("express")
const app = express()
const db = require("./config/mongodb-config")
const landingpage = require("./routes/landingpage")
const auth = require("./routes/auth")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const shop = require("./routes/shop")

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.use("/", landingpage)
app.use("/auth", auth)
app.use("/shop", shop)


app.listen(3001)