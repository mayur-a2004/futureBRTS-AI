const bcrypt = require('bcryptjs');

async function test() {
    try {
        const pass = 'password123';
        const hash = await bcrypt.hash(pass, 10);
        console.log('Hash generated:', hash);
        const match = await bcrypt.compare(pass, hash);
        console.log('Match result:', match);
    } catch (err) {
        console.error('Bcrypt error:', err);
    }
}

test();
