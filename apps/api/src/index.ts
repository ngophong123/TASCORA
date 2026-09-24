import { server, logger } from './server';

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
