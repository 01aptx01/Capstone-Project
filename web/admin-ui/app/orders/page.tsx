import ordersData from "@/lib/mock/orders.json";

export const metadata = { title: 'Orders' };

export default function OrdersPage() {
  const data = ordersData;

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A]">คำสั่งซื้อ</h1>
          <p className="text-[#64748B]">รายการคำสั่งซื้อล่าสุด</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="font-bold mb-3">คำสั่งซื้อ</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-[#64748B]"><th className="py-2">ID</th><th>Time</th><th>Items</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.orders.map((o: any) => (
                <tr key={o.id} className="border-t border-[#EEF2F6]">
                  <td className="py-3">{o.id}</td>
                  <td>{o.time}</td>
                  <td>{o.items}</td>
                  <td>฿{o.amount}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
