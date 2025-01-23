import { Consumer, EachMessagePayload, Kafka, Producer } from "kafkajs";
import { MessageBroker } from "../types/broker";
import { handleProductUpdate } from "../productCache/productUpdateHandler";
import { handleToppingUpdate } from "../toppingCache/toppingUpdateHandler";

export class KafkaBroker implements MessageBroker {
    private consumer: Consumer;
    private producer: Producer;
    
    constructor(clientId: string, brokers: string[]) {
        const kafka = new Kafka({clientId, brokers}) 
        this.producer = kafka.producer()
        this.consumer = kafka.consumer({ groupId: clientId})
    }
    /**
     * connect the consumer
     */
    async connectConsumer () {
        await this.consumer.connect()
    }
    /**
     * connect the producer
     */
    async connectProducer () {
        await this.producer.connect()
    }
    /**
     * disconnect the consumer
     */
    async disconnectConsumer () {
        await this.consumer.disconnect()
    }
    /**
     * disconnect the producer
     */
    async disconnectProducer () {
        if(this.producer){
            await this.producer.disconnect()
        }
    }
 
    /**
     * 
     * @param topic - topic to send message
     * @param message - message to send
     */
    async sendMessage(topic: string, message: string, key:string) {
        const data: { value: string; key?: string } = {
            value: message
        }
        if(key) {
            data.key = key;
        }
        await this.producer.send({
            topic,
            messages: [data]
        })
    }

    async consumeMessage(topics: string[], fromBeginning: boolean = false) {
        await this.consumer.subscribe({topics, fromBeginning})
        await this.consumer.run ({
            eachMessage: async ({topic, partition, message}: EachMessagePayload) => {
                // eslint-disable-next-line no-console
                console.log({
                    value: message.value.toString(),
                    topic,
                    partition,
                })
                //logic to handle incoming message
                switch (topic) {
                    case 'product-topic':
                        await handleProductUpdate(message.value.toString());
                        return;
                    case 'topping-topic':
                        await handleToppingUpdate(message.value.toString());
                        return;
                    default:
                        // eslint-disable-next-line no-console
                        console.log('Doing nothing.....')
                }
               
            }
        })
        
    }


}