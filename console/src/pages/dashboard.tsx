import { Link } from "react-router-dom"
import { ArrowRight, CalendarClock, CircleDollarSign, Users } from "lucide-react"

import { getCustomers } from "@/api/customers"
import { Button } from "@/components/ui/button"

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
})

export function Dashboard() {
  const customers = getCustomers()
  const activeCustomers = customers.filter((item) => item.status === "active")
  const pendingCustomers = customers.filter((item) => item.status === "pending")
  const totalValue = customers.reduce((sum, item) => sum + item.value, 0)
  const recentCustomers = customers.slice(0, 4)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-normal">工作台</h1>
        <p className="text-sm text-muted-foreground">
          查看客户经营概览，并快速进入客户管理。
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={Users}
          label="客户总数"
          value={`${customers.length}`}
          detail={`${activeCustomers.length} 个活跃客户`}
        />
        <MetricCard
          icon={CalendarClock}
          label="待跟进客户"
          value={`${pendingCustomers.length}`}
          detail="需要在本周内完成跟进"
        />
        <MetricCard
          icon={CircleDollarSign}
          label="客户价值"
          value={currencyFormatter.format(totalValue)}
          detail="基于首版 mock 数据统计"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">最近客户动态</h2>
              <p className="text-sm text-muted-foreground">
                最近有跟进记录的客户。
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/customers">
                客户管理
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          <div className="divide-y">
            {recentCustomers.map((customer) => (
              <div
                key={customer.id}
                className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_160px_120px]"
              >
                <div>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.contact} · {customer.city}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  负责人：{customer.owner}
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.lastFollowUp}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-base font-semibold">快捷入口</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            首版聚焦客户管理，后续再扩展更多业务模块。
          </p>
          <Button asChild className="mt-5 w-full">
            <Link to="/customers">进入客户管理</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

type MetricCardProps = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  detail: string
}

function MetricCard({ icon: Icon, label, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-normal">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{detail}</div>
    </div>
  )
}
