const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 9000;
const ADMIN_TOKEN = "YOUR_SECRET_ADMIN_TOKEN";
const LOGS_DIR = path.join(__dirname, '../history_logs');
const PHASE5_DIR = path.join(__dirname, '../automation_engines/phase5');

app.use(cors());
app.use(express.static('public'));

// Middleware: Auth
const auth = (req, res, next) => {
    const token = req.headers['x-admin-token'] || req.query.token;
    if (token === ADMIN_TOKEN) return next();
    res.status(403).json({ error: 'Access Denied' });
};

// API: Logs
app.get('/api/logs', auth, (req, res) => {
    try {
        const files = fs.readdirSync(LOGS_DIR).filter(f => f.endsWith('.log') || f.endsWith('.txt'));
        const logs = files.map(f => {
            const stat = fs.statSync(path.join(LOGS_DIR, f));
            return { name: f, size: stat.size, mtime: stat.mtime };
        }).sort((a,b) => b.mtime - a.mtime);
        res.json(logs);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/logs/:name', auth, (req, res) => {
    try {
        const content = fs.readFileSync(path.join(LOGS_DIR, req.params.name), 'utf8');
        res.send(content);
    } catch (e) { res.status(404).send('Not Found'); }
});

// API: System Stats (stub)
app.get('/api/stats', auth, (req, res) => {
    res.json({
        status: 'ONLINE',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        phase5: fs.existsSync(PHASE5_DIR)
    });
});

app.listen(PORT, () => {
    console.log(\ðŸ”® Nexus running on http://localhost:\\);
});
