import { Download, FileText, Plus, Search } from "lucide-react"
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"
import { useEffect, useState } from "react"

import { getCustomers, type CustomerStatus } from "@/api/customers"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLayoutStore } from "@/stores/layout-store"
import { cn } from "@/lib/utils"

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString()

const documentTemplates = [
  {
    id: "incense-offering-2026",
    name: "香供表文（2026年新最终版）",
    url: "/templates/incense-offering-form.pdf",
  },
] as const

type DocumentTemplateId = (typeof documentTemplates)[number]["id"]

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

type CustomerForm = {
  name: string
  phone: string
  address: string
  incenseBundles: string
  notes: string
}

const initialCustomerForm: CustomerForm = {
  name: "",
  phone: "",
  address: "",
  incenseBundles: "1",
  notes: "",
}

export function Customers() {
  const customers = getCustomers()
  const keyword = useLayoutStore((state) => state.customerKeyword)
  const status = useLayoutStore((state) => state.customerStatus)
  const setKeyword = useLayoutStore((state) => state.setCustomerKeyword)
  const setStatus = useLayoutStore((state) => state.setCustomerStatus)
  const [newCustomer, setNewCustomer] = useState<CustomerForm>(initialCustomerForm)
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<DocumentTemplateId>("incense-offering-2026")
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isRenderingPdf, setIsRenderingPdf] = useState(false)
  const selectedTemplate = documentTemplates.find(
    (template) => template.id === selectedTemplateId,
  )

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl)
      }
    }
  }, [pdfPreviewUrl])

  const updateNewCustomer = <Key extends keyof CustomerForm>(
    key: Key,
    value: CustomerForm[Key],
  ) => {
    setNewCustomer((current) => ({ ...current, [key]: value }))
  }

  const renderPdfPreview = async () => {
    setIsRenderingPdf(true)

    try {
      if (!selectedTemplate) {
        throw new Error("未找到选中的 PDF 模板")
      }

      const { pdfBlob, imageDataUrl } = await createDocumentPdfBlob(
        newCustomer,
        selectedTemplate.url,
      )
      const nextPdfPreviewUrl = URL.createObjectURL(pdfBlob)

      setPdfPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl)
        }

        return nextPdfPreviewUrl
      })
      setImagePreviewUrl(imageDataUrl)
    } finally {
      setIsRenderingPdf(false)
    }
  }

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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              新增客户
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100vh-3rem)] overflow-hidden">
            <div className="grid min-h-0 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
              <div className="min-h-0 overflow-y-auto border-b p-6 lg:border-b-0 lg:border-r">
                <DialogHeader>
                  <DialogTitle>新增客户</DialogTitle>
                  <DialogDescription>填写客户的基本联系信息。</DialogDescription>
                </DialogHeader>

                <div className="mt-6 grid gap-4">
                  <label className="grid gap-2 text-sm font-medium">
                    PDF 模板
                    <Select
                      value={selectedTemplateId}
                      onValueChange={(value) => {
                        setSelectedTemplateId(value as DocumentTemplateId)
                        setImagePreviewUrl(null)
                        setPdfPreviewUrl((currentUrl) => {
                          if (currentUrl) {
                            URL.revokeObjectURL(currentUrl)
                          }

                          return null
                        })
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="请选择 PDF 模板" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>

              <label className="grid gap-2 text-sm font-medium">
                姓名
                <Input
                  value={newCustomer.name}
                  onChange={(event) => updateNewCustomer("name", event.target.value)}
                  placeholder="请输入姓名"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                电话
                <Input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(event) => updateNewCustomer("phone", event.target.value)}
                  placeholder="请输入联系电话"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                详细地址
                <textarea
                  value={newCustomer.address}
                  onChange={(event) => updateNewCustomer("address", event.target.value)}
                  placeholder="请输入省、市、区及详细地址"
                  className="min-h-20 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                特供草香
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={newCustomer.incenseBundles}
                    onChange={(event) =>
                      updateNewCustomer("incenseBundles", event.target.value)
                    }
                    placeholder="请输入数量"
                    className="pr-12"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    捆
                  </span>
                </div>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                备注
                <textarea
                  value={newCustomer.notes}
                  onChange={(event) => updateNewCustomer("notes", event.target.value)}
                  placeholder="请输入备注信息"
                  className="min-h-28 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </label>
                </div>

                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button variant="outline">取消</Button>
                  </DialogClose>
                  <Button type="button">保存客户</Button>
                </DialogFooter>
              </div>

              <div className="min-h-0 overflow-y-auto bg-muted/40 p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">PDF 预览</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedTemplate?.name ?? "请选择模板"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pdfPreviewUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={pdfPreviewUrl} download={`${newCustomer.name || "客户"}-香供表文.pdf`}>
                          <Download className="mr-2 size-4" />
                          下载 PDF
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={renderPdfPreview}
                      disabled={isRenderingPdf}
                    >
                      <FileText className="mr-2 size-4" />
                      {isRenderingPdf ? "渲染中" : "渲染预览"}
                    </Button>
                  </div>
                </div>

                <div className="mx-auto aspect-[1.414/1] w-full max-w-[620px] overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-border">
                  {imagePreviewUrl ? (
                    <img
                      alt="九厘汇通 PDF 预览"
                      src={imagePreviewUrl}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <FileText className="size-7 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">尚未生成 PDF 预览</div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          填写姓名后，点击“渲染预览”查看真实 PDF。
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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

async function createDocumentPdfBlob(customer: CustomerForm, templateUrl: string) {
  const sourcePdf = await getDocument({
    url: templateUrl,
    cMapUrl: "/pdfjs/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/pdfjs/standard_fonts/",
    useSystemFonts: true,
  }).promise
  const sourcePage = await sourcePdf.getPage(1)
  const viewport = sourcePage.getViewport({ scale: 2 })
  const canvas = document.createElement("canvas")
  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)

  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Canvas rendering is not supported.")
  }

  await sourcePage.render({ canvasContext: context, viewport }).promise
  drawCustomerInformation(context, canvas.width, canvas.height, customer)

  const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95)
  const jpegBytes = dataUrlToBytes(imageDataUrl)
  const pdfBytes = buildSingleImagePdf(
    jpegBytes,
    canvas.width,
    canvas.height,
    842,
    595,
  )

  return {
    pdfBlob: new Blob([pdfBytes], { type: "application/pdf" }),
    imageDataUrl,
  }
}

function drawCustomerInformation(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  customer: CustomerForm,
) {
  const scaleX = width / 1684
  const scaleY = height / 1191
  const name = customer.name.trim() || "待填写"
  const phone = customer.phone.trim() || "待填写"
  const address = customer.address.trim() || "待填写"
  const notes = customer.notes.trim()
  const today = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date())

  context.save()
  context.fillStyle = "#111111"
  context.textAlign = "center"
  context.textBaseline = "top"

  context.font = `${Math.round(34 * scaleY)}px "Songti SC", "STSong", serif`
  drawVerticalLine(context, "供奉人", 180 * scaleX, 270 * scaleY, 45 * scaleY)

  context.font = `${Math.round(29 * scaleY)}px "Songti SC", "STSong", serif`
  drawVerticalLine(context, name, 180 * scaleX, 475 * scaleY, 38 * scaleY)

  context.font = `${Math.round(42 * scaleY)}px "Songti SC", "STSong", serif`
  drawVerticalLine(
    context,
    `特供草香${customer.incenseBundles.trim() || "1"}捆`,
    1185 * scaleX,
    270 * scaleY,
    50 * scaleY,
  )

  context.font = `${Math.round(23 * scaleY)}px "Songti SC", "STSong", serif`
  const customerDetails = [
    `${name} 地址 ${address}`,
    `联系电话 ${phone}`,
    `${name} 于 ${today} 为供奉`,
    notes ? `备注 ${notes}` : "",
  ]
    .filter(Boolean)
    .join("  ")

  drawVerticalColumns(
    context,
    customerDetails,
    1560 * scaleX,
    78 * scaleY,
    1060 * scaleY,
    31 * scaleY,
    38 * scaleX,
  )
  context.restore()
}

function drawVerticalLine(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  lineHeight: number,
) {
  Array.from(text).forEach((character, index) => {
    context.fillText(character, x, y + index * lineHeight)
  })
}

function drawVerticalColumns(
  context: CanvasRenderingContext2D,
  text: string,
  startX: number,
  startY: number,
  maxY: number,
  lineHeight: number,
  columnGap: number,
) {
  let x = startX
  let y = startY

  for (const character of Array.from(text)) {
    if (character === " ") {
      y += lineHeight * 0.6
      continue
    }

    if (y + lineHeight > maxY) {
      x -= columnGap
      y = startY
    }

    context.fillText(character, x, y)
    y += lineHeight
  }
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? ""
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function buildSingleImagePdf(
  imageBytes: Uint8Array,
  imageWidth: number,
  imageHeight: number,
  pageWidth: number,
  pageHeight: number,
) {
  const encoder = new TextEncoder()
  const chunks: Uint8Array[] = []
  const offsets: number[] = []
  let length = 0

  const append = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === "string" ? encoder.encode(chunk) : chunk
    chunks.push(bytes)
    length += bytes.length
  }

  const appendObject = (objectNumber: number, body: string | Uint8Array) => {
    offsets[objectNumber] = length
    append(`${objectNumber} 0 obj\n`)
    append(body)
    append("\nendobj\n")
  }

  const contentStream = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ`

  append("%PDF-1.4\n")
  appendObject(1, "<< /Type /Catalog /Pages 2 0 R >>")
  appendObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
  appendObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  )

  offsets[4] = length
  append("4 0 obj\n")
  append(
    `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
  )
  append(imageBytes)
  append("\nendstream\nendobj\n")

  appendObject(5, `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`)

  const xrefOffset = length
  append("xref\n0 6\n")
  append("0000000000 65535 f \n")

  for (let objectNumber = 1; objectNumber <= 5; objectNumber += 1) {
    append(`${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`)
  }

  append(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)

  const pdfBytes = new Uint8Array(length)
  let offset = 0

  chunks.forEach((chunk) => {
    pdfBytes.set(chunk, offset)
    offset += chunk.length
  })

  return pdfBytes
}
