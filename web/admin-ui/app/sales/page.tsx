import salesData from "@/lib/mock/sales.json";

export const metadata = { title: 'Sales' };

export default function SalesPage() {
  const data = salesData;

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A]">ยอดขาย</h1>
          <p className="text-[#64748B]">รายละเอียดยอดขายวันนี้</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#64748B]">วันนี้</div>
          <div className="text-2xl font-extrabold">฿{data.summary.today}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#64748B]">เมื่อวาน</div>
          <div className="text-2xl font-extrabold">฿{data.summary.yesterday}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#64748B]">เปลี่ยนแปลง</div>
          <div className="text-2xl font-extrabold">{data.summary.change_percent}%</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="font-bold mb-3">รายการธุรกรรม (ล่าสุด)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-[#64748B]"><th className="py-2">Order</th><th>Time</th><th>Machine</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.transactions.map((t: any) => (
                <tr key={t.orderId} className="border-t border-[#EEF2F6]">
                  <td className="py-3">{t.orderId}</td>
                  <td>{t.time}</td>
                  <td>{t.machine}</td>
                  <td>฿{t.amount}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
