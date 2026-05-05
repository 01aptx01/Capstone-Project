import LoginCard from "@/components/auth/LoginCard";

export const metadata = {
  title: "Admin Login",
};

export default function LoginPage() {
  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)", zIndex: 9999, padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "440px", minHeight: "560px", flexShrink: 0 }}>
        <LoginCard />
      </div>
    </div>
  );
}


