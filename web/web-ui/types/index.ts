// types/index.ts
export type User = {
  id: string
  name: string
  email: string
  phone: string
  points: number
  avatar?: string
}

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

export type CartItem = {
  menuItem: MenuItem
  quantity: number
}

export type Order = {
  id: string
  items: CartItem[]
  total: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: string
  qrCode?: string
}

export type Coupon = {
  id: string
  title: string
  description: string
  pointsRequired: number
  discount: number
  expiresAt: string
}