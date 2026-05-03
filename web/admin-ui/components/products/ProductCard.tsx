type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-3 rounded-md p-3" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="h-12 w-12 flex-shrink-0 rounded bg-gray-100" />
      <div className="flex-1">
        <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{product.name}</div>
        <div className="text-xs" style={{ color: "var(--muted)" }}>${product.price.toFixed(2)}</div>
      </div>
      <div className="text-sm" style={{ color: "var(--muted)" }}>{product.stock} pcs</div>
    </div>
  );
}


