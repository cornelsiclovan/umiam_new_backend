const fs = require('fs');

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if(error) {
            throw(error);
        }
    })
}

exports.deleteFile = deleteFile;