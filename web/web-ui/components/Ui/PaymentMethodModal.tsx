"use client";

import { useState } from "react";
import { ModalSheet, Button } from "@/components/Ui";
import { cn } from "@/lib/utils";

interface PaymentMethodModalProps {
  onClose: () => void;
  onConfirm: (method: string) => void;
}

function MethodOption({
  id,
  title,
  description,
  badge,
  badgeClass,
  selected,
  onSelect,
}: {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeClass: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all touch-target",
        selected
          ? "border-brand bg-brand-muted/50"
          : "border-border hover:border-border-strong",
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm",
          badgeClass,
        )}
      >
        {badge}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
          selected ? "border-brand" : "border-border-strong",
        )}
      >
        {selected && (
          <div className="w-2.5 h-2.5 bg-brand rounded-full animate-fade-in" />
        )}
      </div>
      <input
        type="radio"
        className="hidden"
        checked={selected}
        onChange={onSelect}
        name="payment-method"
        value={id}
      />
    </label>
  );
}

export function PaymentMethodModal({
  onClose,
  onConfirm,
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("promptpay");

  return (
    <ModalSheet open onClose={onClose} title="เลือกช่องทางชำระเงิน">
      <div className="px-5 pb-2 flex flex-col gap-3">
        <MethodOption
          id="promptpay"
          title="พร้อมเพย์ (PromptPay)"
          description="สแกนจ่ายผ่านแอปธนาคาร"
          badge="PP"
          badgeClass="bg-[#003D6A]"
          selected={selectedMethod === "promptpay"}
          onSelect={() => setSelectedMethod("promptpay")}
        />
        <MethodOption
          id="truemoney"
          title="ทรูมันนี่ (TrueMoney)"
          description="สแกนจ่ายผ่านแอป TrueMoney"
          badge="TM"
          badgeClass="bg-brand"
          selected={selectedMethod === "truemoney"}
          onSelect={() => setSelectedMethod("truemoney")}
        />
      </div>
      <div
        className="p-5 border-t border-border"
        style={{ paddingBottom: "calc(1.25rem + var(--safe-bottom))" }}
      >
        <Button size="lg" fullWidth onClick={() => onConfirm(selectedMethod)}>
          ชำระเงิน
        </Button>
      </div>
    </ModalSheet>
  );
}
