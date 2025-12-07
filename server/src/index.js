import "dotenv/config"; // THIS MUST BE THE FIRST IMPORT
import connectDB from "./config/db.js" //In ES Modules, we MUST include the file extension (.js)
import { app } from "./app.js"

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