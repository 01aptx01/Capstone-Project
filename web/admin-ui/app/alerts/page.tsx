import alertsData from "@/lib/mock/alerts.json";

export const metadata = { title: 'Alerts' };

export default function AlertsPage() {
  const data = alertsData;

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A]">แจ้งเตือน</h1>
          <p className="text-[#64748B]">รายการแจ้งเตือนจากตู้</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="font-bold mb-3">แจ้งเตือนล่าสุด</h2>
        <div className="space-y-3">
          {data.alerts.map((a: any) => (
            <div key={a.id} className="p-3 border rounded-lg border-[#EEF2F6]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{a.type} — {a.machine}</div>
                  <div className="text-sm text-[#64748B]">{a.message}</div>
                </div>
                <div className="text-sm text-[#94A3B8]">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
