export type CustomerStatus = "active" | "pending" | "inactive"

export type Customer = {
  id: string
  name: string
  contact: string
  phone: string
  city: string
  status: CustomerStatus
  owner: string
  lastFollowUp: string
  value: number
}

export const customers: Customer[] = [
  {
    id: "C-1001",
    name: "上海明启科技有限公司",
    contact: "陈思远",
    phone: "138 0000 2711",
    city: "上海",
    status: "active",
    owner: "潘丽",
    lastFollowUp: "2026-07-04",
    value: 128000,
  },
  {
    id: "C-1002",
    name: "杭州云川贸易有限公司",
    contact: "周可",
    phone: "139 2100 6608",
    city: "杭州",
    status: "pending",
    owner: "王磊",
    lastFollowUp: "2026-07-03",
    value: 86000,
  },
  {
    id: "C-1003",
    name: "苏州北辰制造有限公司",
    contact: "李佳",
    phone: "137 8821 4590",
    city: "苏州",
    status: "active",
    owner: "潘丽",
    lastFollowUp: "2026-07-02",
    value: 214000,
  },
  {
    id: "C-1004",
    name: "南京新禾服务中心",
    contact: "顾明",
    phone: "136 5520 9041",
    city: "南京",
    status: "inactive",
    owner: "赵敏",
    lastFollowUp: "2026-06-29",
    value: 42000,
  },
  {
    id: "C-1005",
    name: "宁波远达供应链有限公司",
    contact: "林雨",
    phone: "135 9018 7732",
    city: "宁波",
    status: "pending",
    owner: "王磊",
    lastFollowUp: "2026-07-01",
    value: 96000,
  },
]

export function getCustomers() {
  return customers
}
