const fs = require('fs')

const removeFile = async (path) => {
    // Check for existing image and delete
    await fs.access(path, (err) => {
        if (err) return

        fs.unlinkSync(path)
    })
}

module.exports = removeFile
