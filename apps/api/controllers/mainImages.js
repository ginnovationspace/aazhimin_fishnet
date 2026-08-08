const prisma = require("@aazhimin/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

const uploadMainImage = asyncHandler(async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        throw new AppError("No files were uploaded", 400);
    }

    // Get file from a request
    const uploadedFile = req.files.uploadedFile;

    // Using mv method for moving file to the directory on the server
    await new Promise((resolve, reject) => {
        uploadedFile.mv('../public/' + uploadedFile.name, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    res.status(200).json({ message: "File successfully uploaded" });
});

module.exports = {
  uploadMainImage
};