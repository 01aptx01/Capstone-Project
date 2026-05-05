import RegisterCard from "@/components/auth/RegisterCard";

export const metadata = {
  title: "Admin Registration",
};

export default function RegisterPage() {
  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#f8fafc", zIndex: 9999, padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "520px", minHeight: "700px", flexShrink: 0 }}>
        <RegisterCard />
      </div>
    </div>
  );
}

