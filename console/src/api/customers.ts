export type Customer = {
  id: string
  name: string
  address: string
  documents: string[]
  incenseBundles: number
  notes: string
  createdAt: string
}

export const customers: Customer[] = [
  {
    id: "C-1001",
    name: "陈思远",
    address: "上海市浦东新区世纪大道88号",
    documents: ["香供表文"],
    incenseBundles: 1,
    notes: "每月初一、十五使用",
    createdAt: "2026-07-19 10:26",
  },
  {
    id: "C-1002",
    name: "周可",
    address: "浙江省杭州市西湖区文三路126号",
    documents: ["香供表文", "布施表文"],
    incenseBundles: 2,
    notes: "两种表文一并生成",
    createdAt: "2026-07-18 16:42",
  },
  {
    id: "C-1003",
    name: "李佳",
    address: "江苏省苏州市姑苏区人民路518号",
    documents: ["布施表文"],
    incenseBundles: 1,
    notes: "",
    createdAt: "2026-07-18 09:15",
  },
  {
    id: "C-1004",
    name: "顾明",
    address: "江苏省南京市秦淮区中山南路219号",
    documents: ["香供表文"],
    incenseBundles: 3,
    notes: "地址已核对",
    createdAt: "2026-07-17 14:08",
  },
  {
    id: "C-1005",
    name: "林雨",
    address: "浙江省宁波市鄞州区四明中路666号",
    documents: ["香供表文", "布施表文"],
    incenseBundles: 2,
    notes: "优先生成香供表文",
    createdAt: "2026-07-16 11:30",
  },
]

export function getCustomers() {
  return customers
}
