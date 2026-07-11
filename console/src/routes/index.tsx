import { Navigate, Route, Routes } from "react-router-dom"

import { AdminLayout } from "@/layouts/admin-layout"
import { Customers } from "@/pages/customers"
import { Dashboard } from "@/pages/dashboard"

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
