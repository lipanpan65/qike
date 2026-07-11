import { Search } from "lucide-react"

import { getCustomers, type CustomerStatus } from "@/api/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLayoutStore } from "@/stores/layout-store"
import { cn } from "@/lib/utils"

const statusLabels: Record<CustomerStatus, string> = {
  active: "活跃",
  pending: "待跟进",
  inactive: "暂停",
}

const statusClassNames: Record<CustomerStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  inactive: "bg-slate-100 text-slate-600 ring-slate-600/20",
}

export function Customers() {
  const customers = getCustomers()
  const keyword = useLayoutStore((state) => state.customerKeyword)
  const status = useLayoutStore((state) => state.customerStatus)
  const setKeyword = useLayoutStore((state) => state.setCustomerKeyword)
  const setStatus = useLayoutStore((state) => state.setCustomerStatus)

  const filteredCustomers = customers.filter((customer) => {
    const matchesKeyword =
      customer.name.includes(keyword) ||
      customer.contact.includes(keyword) ||
      customer.phone.includes(keyword)
    const matchesStatus = status === "all" || customer.status === status

    return matchesKeyword && matchesStatus
  })

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">客户管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理客户资料、跟进状态和负责人信息。
          </p>
        </div>
        <Button>新增客户</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索客户名称、联系人或电话"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "全部", value: "all" as const },
              { label: "活跃", value: "active" as const },
              { label: "待跟进", value: "pending" as const },
              { label: "暂停", value: "inactive" as const },
            ].map((item) => (
              <Button
                key={item.value}
                variant={status === item.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">客户</th>
                <th className="px-4 py-3 font-medium">联系人</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">负责人</th>
                <th className="px-4 py-3 font-medium">最近跟进</th>
                <th className="px-4 py-3 text-right font-medium">客户价值</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/40">
                  <td className="px-4 py-4">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-muted-foreground">
                      {customer.id} · {customer.city}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>{customer.contact}</div>
                    <div className="text-muted-foreground">{customer.phone}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        statusClassNames[customer.status],
                      )}
                    >
                      {statusLabels[customer.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">{customer.owner}</td>
                  <td className="px-4 py-4">{customer.lastFollowUp}</td>
                  <td className="px-4 py-4 text-right">
                    {customer.value.toLocaleString("zh-CN")}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button variant="ghost" size="sm">
                      查看
                    </Button>
                    <Button variant="ghost" size="sm">
                      编辑
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
