import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        // We append the current timestamp (Date.now()) to the original name
        // This ensures every file has a unique name, even if the user uploads the same file twice.
        // Example: "profile.jpg" -> "1709898123123-profile.jpg"
        cb(null, Date.now() + "-" + file.originalname)
    }
})

export const upload = multer({
    storage: storage,
})