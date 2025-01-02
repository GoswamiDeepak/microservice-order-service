export interface Customer {
    userId :string;
    firstname: string;
    lastname: string;
    email: string;
    address: Address[];
    tenantId: string;
    createAt: Date;
    updatedAt: Date;
}

export interface Address {
    text: string;
    isDeafult: boolean;
}