import { v2 as cloudinary } from 'cloudinary';
import fs from "fs/promises";
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload
            (localFilePath, {
                resource_type: "auto"
            })
        fs.unlink(localFilePath)
        return response;
    } catch (error) {
        try {
            await fs.unlink(localFilePath);
            console.log("Temporary file removed:", localFilePath);
        } catch (unlinkError) {
            console.error("Error removing temporary file:", unlinkError.message);
        }
        return null;
    }
}
export { uploadOnCloudinary }
