import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // File has been uploaded successfully
        // console.log("File is uploaded on cloudinary ", response.url);

        // Clean up: Delete the local file after success
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        // If upload fails, we remove the locally saved temporary file 
        // as the upload operation got failed
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export { uploadOnCloudinary };