export const formatNumber = (amount) => {
  if (amount === null || amount === undefined || amount === "") {
    return "";
  }
  const numberAmount =
    typeof amount === "string" ? parseFloat(cleanNumberString(amount)) : amount;
  if (isNaN(numberAmount)) {
    return "";
  }
  return numberAmount.toLocaleString("ko-KR");
};

export const formatCurrency = (amount) => {
  const formattedNumber = formatNumber(amount);
  return formattedNumber ? `${formattedNumber}원` : "";
};

export const cleanNumberString = (numStr) => {
  if (typeof numStr !== "string") {
    return numStr;
  }
  // Remove all non-digit characters except for a single decimal point
  return numStr.replace(/[^0-9.]/g, "");
};
