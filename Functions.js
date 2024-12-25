const calculateBMI = (height, weight) => {
    const bmi = weight / ((height / 100) * (height / 100));
    console.log(`Calculated BMI: ${bmi.toFixed(2)}`);
    return "your bmi is " + bmi.toFixed(2);
  },
  convertCurrency = async ({
    amount,
    fromCurrency,
    toCurrency,
    exchangeRate,
  }) => {
    // Simulate currency conversion (you can integrate a real API here)
    const conversionRate = 1.1; // Example conversion rate
    return { convertedAmount: (amount / exchangeRate).toFixed(2) };
  },
  getWeather = async ({ city }) => {
    // Simulate weather API response (you can integrate a real API here)
    return { weather: `Sunny in ${city}` };
  };
const BMIDescription = {
    name: "calculateBMI",
    description:
      "Calculates the Body Mass Index (BMI) for a given height and weight.",
    parameters: {
      type: "object",
      properties: {
        height: {
          type: "number",
          description: "The height in centimeters.",
        },
        weight: {
          type: "number",
          description: "The weight in kilograms.",
        },
      },
      required: ["height", "weight"],
    },
  },
  currencyDescription = {
    name: "convertCurrency",
    description: "Converts an amount from one currency to another.",
    parameters: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "The amount to convert.",
        },
        exchangeRate: {
          type: "number",
          description: "The exchange rate from one currency to another.",
        },
        fromCurrency: {
          type: "string",
          description: "The currency to convert from.",
        },
        toCurrency: {
          type: "string",
          description: "The currency to convert to.",
        },
      },
      required: ["amount", "fromCurrency", "toCurrency", "exchangeRate"],
    },
  },
  getWeatherDescription = {
    name: "getWeather",
    description: "Gets the current weather for a given city.",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "The city to get the weather for.",
        },
      },
      required: ["city"],
    },
  };

export {
  convertCurrency,
  calculateBMI,
  getWeather,
  BMIDescription,
  currencyDescription,
  getWeatherDescription,
};
