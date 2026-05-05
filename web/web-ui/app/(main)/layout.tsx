"use client";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Content */}
      <div className="flex-1">{children}</div>

    </div>
  );
}