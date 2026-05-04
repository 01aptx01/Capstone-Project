import VerifyOTPCard from "@/components/auth/VerifyOTPCard";

export const metadata = {
  title: "Verify OTP",
};

export default function VerifyOTPPage() {
  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#f8fafc", zIndex: 9999, padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "460px", minHeight: "540px", flexShrink: 0 }}>
        <VerifyOTPCard />
      </div>
    </div>
  );
}

