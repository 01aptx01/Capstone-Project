// store/useCartStore.ts
import { create } from "zustand"
import { CartItem, MenuItem } from "@/types"

type CartStore = {
  items: CartItem[]
  addItem: (menuItem: MenuItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (menuItem) => {
    const existing = get().items.find((i) => i.menuItem.id === menuItem.id)
    if (existing) {
      set({ items: get().items.map((i) =>
        i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
      )})
    } else {
      set({ items: [...get().items, { menuItem, quantity: 1 }] })
    }
  },
  removeItem: (id) => set({ items: get().items.filter((i) => i.menuItem.id !== id) }),
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
}))