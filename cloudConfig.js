const cloudinary = require('cloudinary').v2;
const {cloudinaryStorage} = require('multer-storage-cloudinary');

cloudinary.config({

    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.API_SECRET

});

const storage = cloudinaryStorage({

    cloudinary: cloudinary,
    params : {

        folder : 'wanderlust',
        allowedFormats : ['jpg', 'png', 'jpeg'],
        
    },

});

module.exports = {cloudinary , storage};