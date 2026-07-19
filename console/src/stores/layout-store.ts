import { create } from "zustand"

type LayoutState = {
  customerKeyword: string
  setCustomerKeyword: (keyword: string) => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
  customerKeyword: "",
  setCustomerKeyword: (customerKeyword) => set({ customerKeyword }),
}))
