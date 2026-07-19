import { Link } from "react-router-dom"
import { ArrowRight, FileText, PackageOpen, Users } from "lucide-react"

import { getCustomers } from "@/api/customers"
import { Button } from "@/components/ui/button"

export function Dashboard() {
  const customers = getCustomers()
  const totalDocuments = customers.reduce(
    (sum, item) => sum + item.documents.length,
    0,
  )
  const totalIncenseBundles = customers.reduce(
    (sum, item) => sum + item.incenseBundles,
    0,
  )
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
          detail="已录入客户资料"
        />
        <MetricCard
          icon={FileText}
          label="表文总数"
          value={`${totalDocuments}`}
          detail="包含客户选择的全部表文"
        />
        <MetricCard
          icon={PackageOpen}
          label="特供草香"
          value={`${totalIncenseBundles} 捆`}
          detail="按客户登记数量统计"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">最近客户</h2>
              <p className="text-sm text-muted-foreground">
                最近录入的客户与表文信息。
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
                className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_200px_140px]"
              >
                <div>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.address}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.documents.join("、")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.createdAt}
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
