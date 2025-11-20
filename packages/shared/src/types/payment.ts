export enum PaymentStatus {
  PENDING = 'PENDING',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}

export interface EscrowPayment {
  id: string;
  milestoneId: string;
  amount: number;
  status: PaymentStatus;
  heldAt?: Date;
  releasedAt?: Date;
  transactionRef: string;
  createdAt: Date;
  updatedAt: Date;
}

