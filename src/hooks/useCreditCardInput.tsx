import { useRef, useCallback, useState } from 'react';
import { getCardTypeByValue, SINGLE_CARD_TYPE } from '../utils/cardTypes';
import { formatCardNumber, formatExpiry } from '../utils/formatter';
import {
  hasCardNumberReachedMaxLength,
  getCVCError,
  getCardNumberError,
  getExpiryDateError
} from '../utils/validators';

function useCreditCardInput() {
  /*===State, Refs & Utility Fns===*/
  const cardNumberField = useRef<HTMLInputElement>();
  const expiryDateField = useRef<HTMLInputElement>();
  const cvcField = useRef<HTMLInputElement>();

  const [cardType, setCardType] = useState<SINGLE_CARD_TYPE>();
  const [error, setError] = useState();
  const [focused, setFocused] = useState<string | undefined>();

  const [touchedInputs, setTouchedInputs] = useState<{
    [key: string]: boolean;
  }>({
    cardNumber: false,
    expiryDate: false,
    cvc: false
  });

  const [erroredInputs, setErroredInputs] = useState<{
    [key: string]: string | undefined;
  }>({
    cardNumber: undefined,
    expiryDate: undefined,
    cvc: undefined
  });

  const setInputTouched = useCallback((input: string, value) => {
    setTouchedInputs((touchedInputs) => {
      if (touchedInputs[input] === value) return touchedInputs;

      const newTouchedInputs = { ...touchedInputs, [input]: value };
      return newTouchedInputs;
    });
  }, []);

  const setInputError = useCallback((input, error) => {
    setErroredInputs((erroredInputs) => {
      if (erroredInputs[input] === error) return erroredInputs;

      let newError = error;

      const newErroredInputs = { ...erroredInputs, [input]: error };
      if (error) {
        setError(error);
      } else {
        newError = Object.values(newErroredInputs).find(Boolean);
        setError(newError);
      }

      return newErroredInputs;
    });
  }, []);
  /*===End of State, Refs & Utility Fns===*/

  /*===Card Number ===*/
  const handleBlurCardNumber = useCallback(
    (props = {}) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        setFocused(undefined);
        setInputTouched('cardNumber', false);

        const formattedCardNumber = e.target.value || '';
        const cardNumber = formattedCardNumber.replace(/\s/g, '');
        const cardNumberError = getCardNumberError(cardNumber);

        if (!cardNumberError) {
          expiryDateField.current && expiryDateField.current.focus();
        }

        // update cardNumberError if cardNumber is not currently being edited, and show error message only after blurOut change.
        !touchedInputs['cardNumber'] && setInputError('cardNumber', cardNumberError);
        props.onError && props.onError(cardNumberError);
        props.onBlur && props.onBlur(e);
      };
    },
    [setInputTouched]
  );

  const handleChangeCardNumber = useCallback(
    (props = {}) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedCardNumber = e.target.value || '';
        const cardNumber = formattedCardNumber.replace(/\s/g, '');

        const cardType = getCardTypeByValue(cardNumber);

        setCardType(cardType);

        if (cardNumberField.current) {
          cardNumberField.current.value = formatCardNumber(cardNumber);
        }

        setInputTouched('cardNumber', true);
        setInputError('cardNumber', undefined);
        props.onChange && props.onChange(e);
      };
    },
    [setInputTouched, setInputError]
  );

  const handleFocusCardNumber = useCallback((props = {}) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onFocus && props.onFocus(e);
      setFocused('cardNumber');
    };
  }, []);

  const handleKeyPressCardNumber = useCallback((props = {}) => {
    return (e: React.ChangeEvent<HTMLInputElement> & React.KeyboardEvent<HTMLInputElement>) => {
      const formattedCardNumber = e.target.value || '';
      const cardNumber = formattedCardNumber.replace(/\s/g, '');

      if (e.key !== 'Enter') {
        if (hasCardNumberReachedMaxLength(cardNumber)) {
          e.preventDefault();
          expiryDateField.current && expiryDateField.current.focus();
        }
      }

      props.onKeyPress && props.onKeyPress(e);
    };
  }, []);

  const getCardNumberProps = useCallback(
    ({ refKey, ...props } = {}) => ({
      'aria-label': 'Card number',
      autoComplete: 'cc-number',
      id: 'cardNumber',
      name: 'cardNumber',
      placeholder: '0000 0000 0000 0000',
      type: 'tel',
      [refKey || 'ref']: cardNumberField,
      ...props,
      maxLength: cardType ? null : 19,
      onChange: handleChangeCardNumber(props),
      onBlur: handleBlurCardNumber(props),
      onFocus: handleFocusCardNumber(props),
      onKeyPress: handleKeyPressCardNumber(props)
    }),
    [cardType, handleChangeCardNumber, handleBlurCardNumber, handleFocusCardNumber, handleKeyPressCardNumber]
  );
  /*===End of Card Number ===*/

  /*===Card Image ===*/
  const getCardImageProps = useCallback(
    (props = {}) => {
      const images = props.images || {};

      return {
        'aria-label': cardType ? cardType.displayName : 'Placeholder card',
        children: images[cardType ? cardType.type : 'placeholder'] || images.placeholder,
        width: '1.5em',
        height: '1em',
        viewBox: '0 0 24 16',
        ...props
      };
    },
    [cardType]
  );
  /*===End of Card Image ===*/

  /*===Expiry Date ===*/
  const handleBlurExpiryDate = useCallback(
    (props = {}) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        setFocused(undefined);
        setInputTouched('expiryDate', false);

        if (expiryDateField.current) {
          const expiryDateError = getExpiryDateError(expiryDateField.current.value);

          // update expiryDateError if expiryDate is not currently being edited, and show error message only after blurOut change.
          !touchedInputs['expiryDate'] && setInputError('expiryDate', expiryDateError);
          props.onError && props.onError(expiryDateError);
        }

        props.onBlur && props.onBlur(e);
      };
    },
    [setInputTouched]
  );

  const handleChangeExpiryDate = useCallback(
    (props = {}) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        if (expiryDateField.current) {
          expiryDateField.current.value = formatExpiry(e);

          const expiryDateError = getExpiryDateError(expiryDateField.current.value);

          if (!expiryDateError) {
            cvcField.current && cvcField.current.focus();
          }

          setInputTouched('expiryDate', true);
          setInputError('expiryDate', undefined);
        }
        props.onChange && props.onChange(e);
      };
    },
    [setInputError]
  );

  const handleKeyDownExpiryDate = useCallback((props = {}) => {
    return (e: React.ChangeEvent<HTMLInputElement> & React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') {
        if (e.key === 'Backspace' && !e.target.value) {
          cardNumberField.current && cardNumberField.current.focus();
        }
      }
      props.onKeyDown && props.onKeyDown(e);
    };
  }, []);

  const getExpiryDateProps = useCallback(
    ({ refKey, ...props } = {}) => ({
      'aria-label': 'Expiry date in format MM YY',
      autoComplete: 'cc-exp',
      id: 'expiryDate',
      name: 'expiryDate',
      placeholder: 'MM/YY',
      type: 'tel',
      [refKey || 'ref']: expiryDateField,
      ...props,
      onChange: handleChangeExpiryDate(props),
      onBlur: handleBlurExpiryDate(props),
      onKeyDown: handleKeyDownExpiryDate(props)
    }),
    [handleChangeExpiryDate, handleBlurExpiryDate, handleKeyDownExpiryDate]
  );
  /*===End ofExpiry Date ===*/

  /*===CVC ===*/
  const handleBlurCVC = useCallback(
    (props = {}) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        setFocused(undefined);
        setInputTouched('cvc', false);

        const cvc = e.target.value;
        const cvcError = getCVCError(cvc);

        // update cvcError if cvc is not currently being edited, and show error message only after blurOut change.
        !touchedInputs['cvc'] && setInputError('cvc', cvcError);
        props.onError && props.onError(e);

        props.onBlur && props.onBlur(e);
      };
    },
    [setInputTouched]
  );

  const handleChangeCVC = useCallback(
    (props = {}) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputTouched('cvc', true);
        setInputError('cvc', undefined);

        props.onChange && props.onChange(e);
      };
    },
    [setInputError, setInputTouched]
  );

  const handleFocusCVC = useCallback((props = {}) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onFocus && props.onFocus(e);
      setFocused('cvc');
    };
  }, []);

  const handleKeyDownCVC = useCallback((props = {}) => {
    return (e: React.ChangeEvent<HTMLInputElement> & React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !e.target.value) {
        expiryDateField.current && expiryDateField.current.focus();
      }

      props.onKeyDown && props.onKeyDown(e);
    };
  }, []);

  const handleKeyPressCVC = useCallback((props = {}) => {
    return (e: React.KeyboardEvent<HTMLInputElement> & React.ChangeEvent<HTMLInputElement>) => {
      const formattedCVC = e.target.value || '';
      const cvc = formattedCVC.replace(' / ', '');

      if (e.key !== 'Enter') {
        if (cvc.length >= 3) {
          e.preventDefault();
        }
      }

      props.onKeyPress && props.onKeyPress(e);
    };
  }, []);

  const getCVCProps = useCallback(
    ({ refKey, ...props } = {}) => ({
      'aria-label': 'CVC',
      autoComplete: 'cc-csc',
      id: 'cvc',
      name: 'cvc',
      placeholder: 'CVC',
      type: 'tel',
      [refKey || 'ref']: cvcField,
      ...props,
      onBlur: handleBlurCVC(props),
      onChange: handleChangeCVC(props),
      onFocus: handleFocusCVC(props),
      onKeyDown: handleKeyDownCVC(props),
      onKeyPress: handleKeyPressCVC(props)
    }),
    [handleBlurCVC, handleChangeCVC, handleFocusCVC, handleKeyDownCVC, handleKeyPressCVC]
  );
  /*===End of CVC ===*/

  return {
    getCardNumberProps,
    getCardImageProps,
    getExpiryDateProps,
    getCVCProps,
    meta: {
      cardType,
      erroredInputs,
      error,
      focused,
      touchedInputs
    }
  };
}

export default useCreditCardInput;
