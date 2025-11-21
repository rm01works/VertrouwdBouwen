export enum PaymentStatus {
  PENDING = 'PENDING',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}

export enum ProjectPaymentStatus {
  NOT_FUNDED = 'NOT_FUNDED',
  PARTIALLY_FUNDED = 'PARTIALLY_FUNDED',
  FULLY_FUNDED = 'FULLY_FUNDED',
}

export enum ProjectPaymentDirection {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

export enum ProjectPaymentStatusEnum {
  PENDING_CONSUMER = 'PENDING_CONSUMER',
  PENDING_ADMIN_REVIEW = 'PENDING_ADMIN_REVIEW',
  ESCROW_CONFIRMED = 'ESCROW_CONFIRMED',
  REJECTED = 'REJECTED',
}

export enum PayoutStatus {
  PENDING_ADMIN_PAYOUT = 'PENDING_ADMIN_PAYOUT',
  PAID = 'PAID',
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

export interface ProjectPayment {
  id: string;
  projectId: string;
  consumerId: string;
  amount: number;
  direction: ProjectPaymentDirection;
  status: ProjectPaymentStatusEnum;
  transactionRef?: string;
  adminNotes?: string;
  confirmedAt?: Date;
  confirmedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payout {
  id: string;
  projectId: string;
  milestoneId: string;
  contractorId: string;
  amount: number;
  status: PayoutStatus;
  transactionRef?: string;
  adminNotes?: string;
  requestedAt: Date;
  paidAt?: Date;
  paidBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

