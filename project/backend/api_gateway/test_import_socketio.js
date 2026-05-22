try {
    const socketio = require('socket.io');
    console.log("SOCKET.IO LOADED");
} catch (e) {
    console.error("FAILED TO LOAD SOCKET.IO", e);
}
