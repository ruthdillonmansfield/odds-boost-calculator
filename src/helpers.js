// helpers.js
// Format a non-monetary number by removing unnecessary trailing zeros
// but ensuring at least one decimal is shown.
export const formatNumber = (value, decimals = 3) => {
    if (typeof value !== "number" || isNaN(value)) return null;
    // If the value is an integer, display with one decimal.
    if (value % 1 === 0) {
      return value.toFixed(1);
    }
    let str = value.toFixed(decimals);
    // Remove trailing zeros but leave at least one decimal digit.
    str = str.replace(/(\.\d*?[1-9])0+$/, "$1");
    if (str.indexOf('.') === -1) {
      str = str + ".0";
    }
    return str;
  };
  
  // Format a monetary value to always show exactly two decimals.
  export const formatMoney = (value) => {
    if (typeof value !== "number" || isNaN(value)) return null;
    return value.toFixed(2);
  };
  