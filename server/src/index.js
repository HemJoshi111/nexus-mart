import dotenv from "dotenv"
import connectDB from "./config/db.js" //In ES Modules, we MUST include the file extension (.js)
import { app } from "./app.js"


// Load environment variables
dotenv.config({
    path: './.env'
});

// Connect to Database first, THEN start the server
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️  Server is running at port : ${process.env.PORT}`);

        });
    })
    .catch((err) => {
        console.log("❌ MONGO Db connection failed !!! ", err);
    });