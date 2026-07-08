const fs = require('fs');
const path = require('path');

function readUtf16(filename) {
    const p = path.join(__dirname, filename);
    if (fs.existsSync(p)) {
        console.log(`=== ${filename} ===`);
        const content = fs.readFileSync(p, 'utf16le');
        console.log(content);
    } else {
        console.log(`${filename} does not exist.`);
    }
}

readUtf16('errors.log');
readUtf16('errors.txt');
readUtf16('backend_err.log');
readUtf16('tsc_error.log');
