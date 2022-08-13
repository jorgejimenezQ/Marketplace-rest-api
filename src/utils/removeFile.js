const fs = require('fs')

const removeFile = (path) => {
    // Check for existing image and delete
    if (fs.existsSync(path)) {
        fs.unlinkSync(path)
        return true
    }
    return false
}

module.exports = removeFile
