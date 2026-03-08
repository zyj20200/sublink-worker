import fs from 'fs';
import path from 'path';
import { createApp } from '../app/createApp.jsx';
import { createNodeRuntime } from '../runtime/node.js';
import { startNodeHttpServer } from './nodeHttpServer.js';

const runtime = createNodeRuntime(process.env);
const app = createApp(runtime);
const port = Number(process.env.PORT || 8787);

// Serve static files from public directory
app.get('/js/:filename', async (c) => {
    const filename = c.req.param('filename');
    // Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return c.text('Forbidden', 403);
    }
    
    const filePath = path.join(process.cwd(), 'public', 'js', filename);
    
    try {
        if (fs.existsSync(filePath)) {
            const content = await fs.promises.readFile(filePath);
            return c.body(content, 200, {
                'Content-Type': 'application/javascript'
            });
        }
    } catch (e) {
        runtime.logger.error('Error serving static file:', e);
    }
    return c.text('Not Found', 404);
});

app.get('/favicon.ico', async (c) => {
    const filePath = path.join(process.cwd(), 'public', 'favicon.ico');
    try {
        if (fs.existsSync(filePath)) {
            const content = await fs.promises.readFile(filePath);
            return c.body(content, 200, {
                'Content-Type': 'image/x-icon'
            });
        }
    } catch (e) {}
    return c.text('Not Found', 404);
});

startNodeHttpServer(app, { port, logger: runtime.logger });
