import fastify from 'fastify';
import mercurius, { IResolvers } from 'mercurius';
import { schema } from './infra/graphql';
import { createLogger } from './common/logger';
import resolvers from './infra/resolvers';
import ZkopruService from './infra/services/zkopru-service';
import { connectDB } from './infra/db';
import updateExistingOrderStatusUseCase from './use-cases/update-existing-order-status';
import { OrderRepository } from './infra/repositories/order-repository';

const logger = createLogger();

// Create server
const app = fastify({ logger });

// Initialize DB connection
const db = connectDB();

// Initialize Zkopru service
const zkopruService = new ZkopruService({
  websocketUrl: process.env.WEBSOCKET_URL,
  contractAddress: process.env.ZKOPRU_CONTRACT_ADDRESS,
  accountPrivateKey: process.env.WALLET_PRIVATE_KEY,
}, {
  logger,
});

// Start ZKopru client when server starts
app.addHook('onReady', async () => {
  await zkopruService.start();

  // Execute updateExistingOrderStatusUseCase periodically
  async function updateOrderStatus() {
    await updateExistingOrderStatusUseCase({
      logger,
      orderRepository: new OrderRepository(db, { logger }),
      walletService: zkopruService,
    });
    setTimeout(updateOrderStatus, 10 * 1000);
  }

  updateOrderStatus();
});

// Register GraphQL endpoint
export const buildContext = () => ({
  db,
  logger,
  zkopruService,
});

app.register(mercurius, {
  schema,
  context: buildContext,
  resolvers: resolvers as IResolvers,
  graphiql: true,
});

export default app;
