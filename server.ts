import app from "./src/app";
import config from "config";
import logger from "./src/config/logger";
import connectDB from "./src/config/db";
import { MessageBroker } from "./src/types/broker";
import { createMessageBroker } from "./src/common/factories/brokerFactory";

const startServer = async () => {
  const PORT = config.get("server.port") || 5503;
  let broker: MessageBroker | null = null;
  try {
    await connectDB();

    broker = createMessageBroker();
    await broker.connectProducer();
    await broker.connectConsumer();
    await broker.consumeMessage(['product-topic','topping-topic'], false)

    app
      .listen(PORT, () => logger.info(`Listening on port ${PORT}`))
      .on("error", (err) => {
        // eslint-disable-next-line no-console
        console.log("err", err.message);
        process.exit(1);
      });
  } catch (err) {
    logger.error("Error happened: ", err.message);
    if (broker) {
      await broker.disconnectProducer();
      await broker.disconnectConsumer();
    }
    process.exit(1);
  }
};

void startServer();
