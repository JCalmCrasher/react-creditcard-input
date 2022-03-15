import { getCardTypeByValue } from "./cardTypes";

const MONTH_REGEX = /(0[1-9]|1[0-2])/;

export const EMPTY_CARD_NUMBER = "Enter a card number";
export const EMPTY_EXPIRY_DATE = "Enter an expiry date";
export const EMPTY_CVC = "Enter a CVC";

export const INVALID_CARD_NUMBER = "Card number is invalid";
export const INVALID_EXPIRY_DATE = "Expiry date is invalid";
export const INVALID_CVC = "CVC is invalid";

export const MONTH_OUT_OF_RANGE = "Expiry month must be between 01 and 12";
export const YEAR_OUT_OF_RANGE = "Expiry year cannot be in the past";
export const DATE_OUT_OF_RANGE = "Expiry date cannot be in the past";

export const hasCardNumberReachedMaxLength = (currentValue: string) => {
  const cardType = getCardTypeByValue(currentValue);
  return (
    cardType &&
    currentValue.length >= cardType.lengths[cardType.lengths.length - 1]
  );
};

// https://en.wikipedia.org/wiki/Luhn_algorithm
// luhn validation
export const validateLuhn = (cardNumber: string) => {
  return (
    cardNumber
      .split("")
      .reverse()
      .map((digit) => parseInt(digit, 10))
      .map((digit, idx) => (idx % 2 ? digit * 2 : digit))
      .map((digit) => (digit > 9 ? (digit % 10) + 1 : digit))
      .reduce((accum, digit) => (accum += digit)) %
      10 ===
    0
  );
};

export const getCardNumberError = (
  cardNumber: string,
  { errorMessages = {} as any } = {}
) => {
  if (!cardNumber) {
    return errorMessages.emptyCardNumber || EMPTY_CARD_NUMBER;
  }

  const rawCardNumber = cardNumber.replace(/\s/g, "");

  const cardType = getCardTypeByValue(rawCardNumber);

  if (cardType && cardType.lengths) {
    const doesCardNumberMatchLength = cardType.lengths.includes(
      rawCardNumber.length
    );
    if (doesCardNumberMatchLength) {
      const isLuhnValid = validateLuhn(rawCardNumber);
      return isLuhnValid;
    }
  }
  return errorMessages.invalidCardNumber || INVALID_CARD_NUMBER;
};

export const getExpiryDateError = (
  expiryDate: string,
  { errorMessages = {} as any } = {}
) => {
  if (!expiryDate) {
    return errorMessages.emptyExpiryDate || EMPTY_EXPIRY_DATE;
  }

  const rawExpiryDate = expiryDate.replace(" / ", "").replace("/", "");

  if (rawExpiryDate.length === 4) {
    const month = rawExpiryDate.slice(0, 2);
    const year = `20${rawExpiryDate.slice(2, 4)}`;
    if (!MONTH_REGEX.test(month)) {
      return errorMessages.monthOutOfRange || MONTH_OUT_OF_RANGE;
    }
    if (parseInt(year) < new Date().getFullYear()) {
      return errorMessages.yearOutOfRange || YEAR_OUT_OF_RANGE;
    }
    if (
      parseInt(year) === new Date().getFullYear() &&
      parseInt(month) < new Date().getMonth() + 1
    ) {
      return errorMessages.dateOutOfRange || DATE_OUT_OF_RANGE;
    }

    return;
  }
  return errorMessages.invalidExpiryDate || INVALID_EXPIRY_DATE;
};

export const getCVCError = (
  cvc: string,
  { errorMessages = {} as any } = {}
) => {
  if (!cvc) {
    return errorMessages.emptyCVC || EMPTY_CVC;
  }
  if (cvc.length < 3) {
    return errorMessages.invalidCVC || INVALID_CVC;
  }
};