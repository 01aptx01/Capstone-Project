import RegisterCard from "@/components/auth/RegisterCard";

export const metadata = {
  title: "Admin Registration",
};

export default function RegisterPage() {
  return (
    <div style={{ width: "100%", maxWidth: "520px", flexShrink: 0 }}>
      <RegisterCard />
    </div>
  );
}

