const prisma = require("@fishnet/database");
const { asyncHandler } = require("../middleware/errorHandler");

const getSingleProductImages = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const images = await prisma.image.findMany({
    where: { productID: id },
  });
  if (images.length === 0) {
    return response.status(404).json({ error: "Images not found" });
  }
  return response.json(images);
});

const createImage = asyncHandler(async (request, response) => {
  try {
    const { productID, image } = request.body;
    const createImage = await prisma.image.create({
      data: {
        productID: productID,
        image: image,
      },
    });
    return response.status(201).json(createImage);
  } catch (error) {
    console.error("Error creating image:", error);
    return response.status(500).json({ error: "Error creating image" });
  }
});

const updateImage = asyncHandler(async (request, response) => {
  try {
    const { id } = request.params;
    const { productID, image } = request.body;

    // Check if image exists
    const existingImage = await prisma.image.findUnique({
      where: {
        imageID: id,
      },
    });

    // if image doesn't exist, return error
    if (!existingImage) {
      return response
        .status(404)
        .json({ error: "Image not found" });
    }

    // Update image
    const updatedImage = await prisma.image.update({
      where: {
        imageID: id,
      },
      data: {
        productID: productID,
        image: image,
      },
    });

    return response.json(updatedImage);
  } catch (error) {
    console.error("Error updating image:", error);
    return response.status(500).json({ error: "Error updating image" });
  }
});

const deleteImage = asyncHandler(async (request, response) => {
  try {
    const { id } = request.params;
    await prisma.image.delete({
      where: {
        imageID: id,
      },
    });
    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting image:", error);
    return response.status(500).json({ error: "Error deleting image" });
  }
});

module.exports = {
  getSingleProductImages,
  createImage,
  updateImage,
  deleteImage,
};
