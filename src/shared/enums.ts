export enum AppointmentStatus {
  requested = 'requested',
  scheduled = 'scheduled',
  missed = 'missed',
  canceled = 'canceled',
  in_progress = 'in_progress',
  pending_resolution = 'pending_resolution',
  completed = 'completed',
}

export enum AppointmentPriority {
  Emergency = 'Emergency',
  Urgent = 'Urgent',
  Important = 'Important',
  Discretionary = 'Discretionary',
}

export enum InvoicePaymentMethod {
  cash = 'cash',
  credit_card = 'credit_card',
}

export enum InvoiceItemType {
  materials = 'materials',
  tax = 'tax',
}

export enum InvoiceStatus {
  pending = 'pending',
  paid = 'paid',
}
