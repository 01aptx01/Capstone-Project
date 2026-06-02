/** Omise Thailand minimum charge (20 THB = 2000 satang). */
export const MIN_PAYMENT_AMOUNT_THB = 20;
export const MIN_PAYMENT_AMOUNT_SATANG = MIN_PAYMENT_AMOUNT_THB * 100;

export const MIN_PAYMENT_MESSAGE_TH =
  `ยอดชำระขั้นต่ำ ${MIN_PAYMENT_AMOUNT_THB} บาท (ตามเงื่อนไขผู้ให้บริการชำระเงิน)`;

export function isBelowMinimumPayment(amountThb: number): boolean {
  return amountThb < MIN_PAYMENT_AMOUNT_THB;
}
