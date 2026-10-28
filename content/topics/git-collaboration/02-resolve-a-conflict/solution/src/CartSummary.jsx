export default function CartSummary({ items }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return (
    <p className="cart-summary">
      {items.length === 1 ? "1 item" : `${items.length} items`} in the cart, ${total.toFixed(2)}
    </p>
  );
}
