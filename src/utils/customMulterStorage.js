const sharp = require('sharp')
const _path = require('path')
var fs = require('fs')

function getDestination(req, file, cb) {
    cb(null, '/dev/null')
}

function MyCustomStorage(opts) {
    this.getDestination = opts.destination || getDestination
}

MyCustomStorage.prototype._handleFile = function _handleFile(req, file, cb) {
    this.getDestination(req, file, function (err, path) {
        if (err) return cb(err)

        var outStream = fs.createWriteStream(path)
        var resizer = sharp().resize(100, 100)

        // console.log(_path.dirname(path))
        // console.log(path)
        // Check if the directory exist, if not, create it
        if (!fs.existsSync(_path.dirname(path))) {
            fs.mkdir(_path.dirname(path), (err) => {
                if (err) return cb(err)
            })
        }

        // Add the filename and the path to file
        file.path = file.filename = file.stream.pipe(resizer).pipe(outStream)
        outStream.on('error', cb)
        outStream.on('finish', function () {
            cb(null, {
                path: _path.dirname(path),
                filename: _path.basename(path),
                size: outStream.bytesWritten,
            })
        })
    })
}

MyCustomStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    fs.unlink(file.path, cb)
}

module.exports = function (opts) {
    return new MyCustomStorage(opts)
}
