// app/(auth)/login/page.tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)

  const handleLogin = async () => {
    // TODO: เชื่อม API จริง
    // const res = await fetch("/api/auth/login", { ... })
    document.cookie = "token=mock-token; path=/"
    router.push("/home")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-8">
      <img src="/images/logo.png" alt="MOD PAO" className="w-24 h-24 mb-2" />
      <h1 className="text-2xl font-bold mb-6">MOD PAO</h1>

      <div className="w-full max-w-sm space-y-4">
        <div>
          <label className="text-sm text-gray-500">email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            remember me
          </label>
          <a href="#" className="text-gray-400">Forgot Password?</a>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-primary text-white py-3 rounded-full font-semibold"
        >
          Login
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">Term of use</p>
      </div>
    </div>
  )
}