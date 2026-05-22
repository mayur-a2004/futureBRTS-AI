try {
    const mongoose = require('mongoose');
    console.log("MONGOOSE LOADED");
} catch (e) {
    console.error("FAILED TO LOAD MONGOOSE", e);
}
