export interface CardError {
  emptyCardNumber: string;
  invalidCardNumber: string;
}

export interface ExpiryDateError {
  emptyExpiryDate: string;
  monthOutOfRange: string;
  yearOutOfRange: string;
  dateOutOfRange: string;
  invalidExpiryDate: string;
}

export interface CVCError {
  emptyCVC?: string;
  invalidCVC?: string;
}
