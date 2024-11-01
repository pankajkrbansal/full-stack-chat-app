import express from "express"
import cors from "cors"
import userRouter from "./router/user.router.js"
const app = express()

app.use(cors())
app.use("/user", userRouter)


app.listen(1080, () => {
    console.log(
    "Server @ 3000"
    );
})
