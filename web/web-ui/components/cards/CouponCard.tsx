import { Coupon } from "@/lib/constants";
import { Card } from "@/components/Ui";

interface CouponCardProps {
  coupon: Coupon;
  action?: React.ReactNode;
}

export function CouponCard({ coupon, action }: CouponCardProps) {
  return (
    <Card padding="none" className="flex flex-col transition-transform hover:scale-[1.01]">
      <div className={`relative h-32 ${coupon.colorBg} flex items-center justify-center`}>
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" aria-hidden>
          <path d="M15 5V3H9v2M15 21v-2H9v2M5 9a2 2 0 0 0 2-2V5h10v2a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2v2H7v-2a2 2 0 0 0-2-2V9z" />
          <line x1="9" y1="12" x2="15" y2="12" strokeDasharray="2 2" />
        </svg>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-foreground text-center mb-1">{coupon.title}</h3>
        <p className="text-sm text-muted text-center mb-6">{coupon.description}</p>
        <div className="mt-auto flex justify-between items-center border-t border-border pt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-brand">{coupon.points}</span>
            <span className="text-xs font-bold text-brand uppercase">Points</span>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </Card>
  );
}

