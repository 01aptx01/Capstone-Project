/** Format phone number with dash: 0xx-xxxxxxx */
export function displayFormattedPhone(phoneNumber: string): string {
  if (!phoneNumber) return "xxx-xxxxxxx";
  if (phoneNumber.length > 3) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
  return phoneNumber;
}
