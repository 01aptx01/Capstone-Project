export async function buyProduct(productId) {
  const res = await fetch("/api/buy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      machine_id: 1,
      product_id: productId,
    }),
  });

  if (!res.ok) {
    throw new Error("Out of stock");
  }

  return res.json();
}
