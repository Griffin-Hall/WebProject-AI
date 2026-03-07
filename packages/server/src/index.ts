import 'dotenv/config';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';

const app = createApp();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
