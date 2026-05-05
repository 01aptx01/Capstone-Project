export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[1600px] mx-auto space-y-12">{children}</div>;
}
