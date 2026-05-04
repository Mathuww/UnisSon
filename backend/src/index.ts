import server from "./app.js";
import { logger } from './middleware/logger.js';

// On écoute
const port = process.env.PORT || 5175;
server.listen(port, () => {
    logger.info(`Listening on ${port}`);
});