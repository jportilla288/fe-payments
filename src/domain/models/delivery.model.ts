export interface DeliveryInput {
  readonly recipientName: string;
  readonly address: string;
  readonly city: string;
  readonly region: string;
  readonly country: string;
  readonly phoneNumber: string;
  readonly postalCode?: string;
}
