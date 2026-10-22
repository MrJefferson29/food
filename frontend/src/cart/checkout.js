const ORDER_EMAIL = "pasturechoise@gmail.com";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

export function createOrderEmail(items, subtotal) {
  const divider = "============================================================";
  const orderLines = items.map((item, index) => {
    const quantityLabel =
      item.unit === "lb"
        ? `${item.quantity.toFixed(2)} lb`
        : `${item.quantity} ${item.quantity === 1 ? "item" : "items"}`;

    return [
      `${index + 1}. ${item.title}`,
      `   Quantity: ${quantityLabel}`,
      `   Unit price: ${formatCurrency(item.price)}${item.unit === "lb" ? " / lb" : ""}`,
      `   Line total: ${formatCurrency(item.price * item.quantity)}`,
    ].join("\n");
  });

  const subject = `Order request - Meat Market - ${new Date().toLocaleDateString("en-US")}`;
  const body = [
    "MEAT MARKET",
    "LOCAL SUPPLY. EXCEPTIONAL QUALITY.",
    divider,
    "ORDER REQUEST",
    `Date: ${new Date().toLocaleString("en-US")}`,
    "",
    "ORDER SUMMARY",
    divider,
    ...orderLines.flatMap((line) => [line, ""]),
    divider,
    `TOTAL: ${formatCurrency(subtotal)}`,
    divider,
    "",
    "Please confirm product availability and the next steps for completing this order.",
    "",
    "Thank you,",
    "Meat Market Customer",
  ].join("\n");

  return {
    recipient: ORDER_EMAIL,
    subject,
    body,
    url: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(ORDER_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}

export { formatCurrency };
