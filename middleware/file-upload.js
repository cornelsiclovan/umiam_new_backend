const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'application/pdf': 'pdf',
    'application/zip': 'zip'
}

const fileUpload = multer({
    limits: 500000,
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            console.log("multeeeeeeeeeeeeeer");
            if(file.fieldname == 'image') {
                cb(null, 'images');
            } else {
                cb(null, 'documents');
            }
        },
        filename: (req, file, cb) => {
            console.log("muuleeeeeeer");
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null, uuidv4() + "." + ext);
        }
    })
});

module.exports = fileUpload; 