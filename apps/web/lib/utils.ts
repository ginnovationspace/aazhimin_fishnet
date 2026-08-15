export const categoryMenuList = [
  {
    id: 1,
    title: "Gill Nets",
    src: "/icons/gill-net.png",
    href: "/shop/gill-nets"
  },
  {
    id: 2,
    title: "Cast Nets",
    src: "/icons/cast-net.png",
    href: "/shop/cast-nets"
  },
  {
    id: 3,
    title: "Seine Nets",
    src: "/icons/seine-net.png",
    href: "/shop/seine-nets"
  },
  {
    id: 4,
    title: "Trawl Nets",
    src: "/icons/trawl-net.png",
    href: "/shop/trawl-nets"
  },
  {
    id: 5,
    title: "Fishing Lines",
    src: "/icons/fishing-line.png",
    href: "/shop/fishing-lines"
  },
  {
    id: 6,
    title: "Nylon Nets",
    src: "/icons/nylon-net.png",
    href: "/shop/nylon-nets"
  },
  {
    id: 7,
    title: "HDPE Nets",
    src: "/icons/hdpe-net.png",
    href: "/shop/hdpe-nets"
  },
  {
    id: 8,
    title: "Monofilament Nets",
    src: "/icons/monofilament-net.png",
    href: "/shop/monofilament-nets"
  },
  {
    id: 9,
    title: "Multifilament Nets",
    src: "/icons/multifilament-net.png",
    href: "/shop/multifilament-nets"
  },
  {
    id: 10,
    title: "Custom Nets",
    src: "/icons/custom-net.png",
    href: "/shop/custom-nets"
  },
];

export const incentives = [
  {
    name: "Verified Sellers",
    description:
      "All sellers are verified to ensure trustworthy transactions.",
    imageSrc: "/icons/verified-seller.png",
  },
  {
    name: "Secure Payments",
    description:
      "Your payments are protected with secure payment processing.",
    imageSrc: "/icons/secure-payment.png",
  },
  {
    name: "Buyer Protection",
    description:
      "We protect your purchases with our buyer protection program.",
    imageSrc: "/icons/buyer-protection.png",
  },
];

export const navigation = {
  sale: [
    { name: "Discounts", href: "#" },
    { name: "News", href: "#" },
    { name: "Register Discounts", href: "#" },
  ],
  about: [
    { name: "About fishnet", href: "#" },
    { name: "Work With Us", href: "#" },
    { name: "Company Profile", href: "#" },
  ],
  buy: [
    { name: "fishnet Loyalty Card", href: "#" },
    { name: "Terms Of Use", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Complaints", href: "#" },
    { name: "Partners", href: "#" },
  ],
  help: [
    { name: "Contact", href: "#" },
    { name: "How to Buy at fishnet", href: "#" },
    { name: "FAQ", href: "#" },
  ],
};

export const isValidNameOrLastname = (input: string) => {
  // Simple name or lastname regex format check
  const regex = /^[a-zA-Z\s]+$/;
  return regex.test(input);
};

export const isValidEmailAddressFormat = (input: string) => {
  // simple email address format check
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(input);
};

export const isValidCardNumber = (input: string) => {
  // Remove all non-digit characters
  const cleanedInput = input.replace(/[^0-9]/g, "");

  // Check if the cleaned input has valid length (13-19 digits)
  if (!/^\d{13,19}$/.test(cleanedInput)) {
    return false;
  }

  // Implement Luhn algorithm for credit card validation
  return luhnCheck(cleanedInput);
};

/**
 * Luhn algorithm implementation for credit card validation
 * @param cardNumber - The credit card number as a string
 * @returns boolean - true if the card number is valid according to Luhn algorithm
 */
const luhnCheck = (cardNumber: string): boolean => {
  let sum = 0;
  let isEven = false;

  // Process digits from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Enhanced credit card validation with card type detection
 * @param input - The credit card number as a string
 * @returns object with validation result and card type
 */
export const validateCreditCard = (input: string) => {
  const cleanedInput = input.replace(/[^0-9]/g, "");

  // Basic length and format check
  if (!/^\d{13,19}$/.test(cleanedInput)) {
    return {
      isValid: false,
      cardType: 'unknown',
      error: 'Invalid card number format'
    };
  }

  // Luhn algorithm check
  if (!luhnCheck(cleanedInput)) {
    return {
      isValid: false,
      cardType: 'unknown',
      error: 'Invalid card number (Luhn check failed)'
    };
  }

  // Detect card type based on BIN (Bank Identification Number)
  const cardType = detectCardType(cleanedInput);

  return {
    isValid: true,
    cardType,
    error: null
  };
};

/**
 * Detect credit card type based on BIN patterns
 * @param cardNumber - The credit card number as a string
 * @returns string - The detected card type
 */
const detectCardType = (cardNumber: string): string => {
  const firstDigit = cardNumber[0];
  const firstTwoDigits = cardNumber.substring(0, 2);
  const firstFourDigits = cardNumber.substring(0, 4);
  const firstThreeDigits = cardNumber.substring(0, 3);

  // Visa: starts with 4
  if (firstDigit === '4') {
    return 'visa';
  }

  // Mastercard: starts with 5 or 2
  if (firstDigit === '5' || (firstTwoDigits >= '22' && firstTwoDigits <= '27')) {
    return 'mastercard';
  }

  // American Express: starts with 34 or 37
  if (firstTwoDigits === '34' || firstTwoDigits === '37') {
    return 'amex';
  }

  // Discover: starts with 6011, 65, or 644-649
  if (firstFourDigits === '6011' || firstTwoDigits === '65' ||
      (firstThreeDigits >= '644' && firstThreeDigits <= '649')) {
    return 'discover';
  }

  // Diners Club: starts with 300-305, 36, or 38
  if ((firstThreeDigits >= '300' && firstThreeDigits <= '305') ||
      firstTwoDigits === '36' || firstTwoDigits === '38') {
    return 'diners';
  }

  // JCB: starts with 35
  if (firstTwoDigits === '35') {
    return 'jcb';
  }

  return 'unknown';
};

export const isValidCreditCardExpirationDate = (input: string) => {
  // simple expiration date format check
  const regex = /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/;
  return regex.test(input);
};

export const isValidCreditCardCVVOrCVC = (input: string) => {
  // simple CVV or CVC format check
  const regex = /^[0-9]{3,4}$/;
  return regex.test(input);
};