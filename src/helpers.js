export const formatNumber = (value, decimals = 3) => {
  if (typeof value !== "number" || isNaN(value)) return null;
  if (value % 1 === 0) {
    return value.toFixed(1);
  }
  let str = value.toFixed(decimals);
  str = str.replace(/(\.\d*?[1-9])0+$/, "$1");
  if (str.indexOf('.') === -1) {
    str = str + ".0";
  }
  return str;
};

export const formatMoney = (value) => {
  if (typeof value !== "number" || isNaN(value)) return null;
  return value.toFixed(2);
};
