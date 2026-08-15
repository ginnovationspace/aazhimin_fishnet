const prisma = require("@fishnet/database");
const path = require("path");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

const uploadMainImage = asyncHandler(async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        throw new AppError("No files were uploaded", 400);
    }

    // Get file from a request
    const uploadedFile = req.files.uploadedFile;

    const filename = path.basename(uploadedFile.name);
    const uploadPath = path.resolve(__dirname, "../../web/public", filename);

    await new Promise((resolve, reject) => {
        uploadedFile.mv(uploadPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    res.status(200).json({ message: "File successfully uploaded", filename });
});

module.exports = {
  uploadMainImage
};
