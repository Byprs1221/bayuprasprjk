import './db.js'; // opens DB and applies migrations on import
import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[server] Backend listening on http://localhost:${config.port}`);
});
