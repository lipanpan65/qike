import { create } from "zustand"

import type { CustomerStatus } from "@/api/customers"

type StatusFilter = CustomerStatus | "all"

type LayoutState = {
  customerKeyword: string
  customerStatus: StatusFilter
  setCustomerKeyword: (keyword: string) => void
  setCustomerStatus: (status: StatusFilter) => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
  customerKeyword: "",
  customerStatus: "all",
  setCustomerKeyword: (customerKeyword) => set({ customerKeyword }),
  setCustomerStatus: (customerStatus) => set({ customerStatus }),
}))
