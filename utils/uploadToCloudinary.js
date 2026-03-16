const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ecommerce" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      },
    );
    stream.end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;
