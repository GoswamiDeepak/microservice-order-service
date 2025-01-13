//stratagic pattern / contract
export interface PaymentOptions {
    currency?: 'inr';
    amount: number;
    orderId: string;
    tenantId: string;
    idempotencyKey?: string;
}
type GatewayPaymentStatus = "no_payment_required" | "paid" | "unpaid"
export interface PayementSession {
    id: string;
    paymentUrl: string;
    paymentStatus: GatewayPaymentStatus
}

export interface CustomMetadata {
    orderId: string;
}
export interface VerifiedSession {
    id: string;
    metadata: CustomMetadata
    paymentStatus:GatewayPaymentStatus
}

export interface PaymentGW {
    createSession: (options: PaymentOptions) => Promise<PayementSession> 
    getSession: (id: string) =>Promise<VerifiedSession>
}