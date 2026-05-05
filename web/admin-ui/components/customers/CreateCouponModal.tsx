"use client";

import CouponFormModal from "@/components/customers/CouponFormModal";

interface CreateCouponModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateCouponModal({ open, onClose }: CreateCouponModalProps) {
  return <CouponFormModal open={open} onClose={onClose} mode="create" />;
}
