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
    "PASTURE CHOICE BEEF",
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

  const query = new URLSearchParams({ to: ORDER_EMAIL, subject, body });
  const mailtoUrl = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return {
    recipient: ORDER_EMAIL,
    subject,
    body,
    gmailAppUrl: `googlegmail://co?${query.toString()}`,
    androidIntentUrl: `intent://co?${query.toString()}#Intent;scheme=googlegmail;package=com.google.android.gm;S.browser_fallback_url=${encodeURIComponent(mailtoUrl)};end`,
    mailtoUrl,
  };
}

export { formatCurrency };
