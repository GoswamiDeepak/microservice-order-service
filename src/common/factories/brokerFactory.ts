import config from "config";
import { MessageBroker } from "../../types/broker";
import { KafkaBroker } from "../../config/kafka";

// Variable to hold the single instance
let broker: MessageBroker | null = null;

// Factory function to create or return the singleton instance
export const createMessageBroker = (): MessageBroker => {
    // Check if the instance already exists
    if (!broker) {
        // Create a new instance if it doesn't exist
        broker = new KafkaBroker("order-service", [
            config.get("kafka.broker"),
        ]);
    }
    // Return the singleton instance
    return broker;
};