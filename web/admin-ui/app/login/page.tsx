import LoginCard from "@/components/auth/LoginCard";

export const metadata = {
  title: "Admin Login",
};

export default function LoginPage() {
  return (
    <div style={{ width: "100%", maxWidth: "440px", flexShrink: 0 }}>
      <LoginCard />
    </div>
  );
}


