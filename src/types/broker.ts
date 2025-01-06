export interface MessageBroker {
    connectConsumer: () => Promise<void>;
    disconnectConsumer: () => Promise<void>;
    consumeMessage: (toping:string, fromBegining: boolean) => Promise<void>;
}