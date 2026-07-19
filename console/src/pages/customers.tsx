import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  LoaderCircle,
  MessageCircle,
  Paperclip,
  Plus,
  Printer,
  RefreshCw,
  Search,
  X,
} from "lucide-react"
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"
import { useCallback, useEffect, useRef, useState } from "react"

import { getCustomers, type Customer } from "@/api/customers"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLayoutStore } from "@/stores/layout-store"

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString()

const documentTemplates = [
  {
    id: "incense-offering-2026",
    name: "香供表文（2026年新最终版）",
    url: "/templates/incense-offering-form.pdf",
    kind: "incense-offering",
  },
  {
    id: "almsgiving-2026-a5",
    name: "布施表文（2026年 · 小字A5纸）",
    url: "/templates/almsgiving-form-2026-a5.pdf",
    kind: "almsgiving",
  },
] as const

type DocumentTemplateId = (typeof documentTemplates)[number]["id"]
type DocumentTemplate = (typeof documentTemplates)[number]

type CustomerForm = {
  name: string
  address: string
  incenseBundles: string
  notes: string
}

type CustomerDocumentAsset = {
  documentName: string
  pdfUrl: string
  imageDataUrl: string
}

const initialCustomerForm: CustomerForm = {
  name: "",
  address: "",
  incenseBundles: "1",
  notes: "",
}

export function Customers() {
  const customers = getCustomers()
  const keyword = useLayoutStore((state) => state.customerKeyword)
  const setKeyword = useLayoutStore((state) => state.setCustomerKeyword)
  const [createdDate, setCreatedDate] = useState<Date | undefined>(() => new Date())
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [documentFilter, setDocumentFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState("10")
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [customerDocumentAssets, setCustomerDocumentAssets] = useState<
    CustomerDocumentAsset[]
  >([])
  const [isGeneratingCustomerAssets, setIsGeneratingCustomerAssets] =
    useState(false)
  const [copiedDocumentName, setCopiedDocumentName] = useState<string | null>(
    null,
  )
  const [copyFailedDocumentName, setCopyFailedDocumentName] = useState<
    string | null
  >(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState<CustomerForm>(initialCustomerForm)
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<DocumentTemplateId>("incense-offering-2026")
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isRenderingPdf, setIsRenderingPdf] = useState(false)
  const previewRenderId = useRef(0)
  const selectedTemplate = documentTemplates.find(
    (template) => template.id === selectedTemplateId,
  )
  const incenseBundleCount = Number(newCustomer.incenseBundles)
  const isCustomerFormValid =
    newCustomer.name.trim().length > 0 &&
    newCustomer.address.trim().length > 0 &&
    Number.isInteger(incenseBundleCount) &&
    incenseBundleCount > 0

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl)
      }
    }
  }, [pdfPreviewUrl])

  useEffect(() => {
    let cancelled = false

    if (!viewingCustomer) {
      setCustomerDocumentAssets([])
      setIsGeneratingCustomerAssets(false)
      return
    }

    const customerForm: CustomerForm = {
      name: viewingCustomer.name,
      address: viewingCustomer.address,
      incenseBundles: String(viewingCustomer.incenseBundles),
      notes: viewingCustomer.notes,
    }

    setIsGeneratingCustomerAssets(true)
    void Promise.all(
      viewingCustomer.documents.map(async (documentName) => {
        const template = documentTemplates.find((item) =>
          documentName === "香供表文"
            ? item.kind === "incense-offering"
            : item.kind === "almsgiving",
        )

        if (!template) {
          return null
        }

        const { pdfBlob, imageDataUrl } = await createDocumentPdfBlob(
          customerForm,
          template,
        )

        return {
          documentName,
          pdfUrl: URL.createObjectURL(pdfBlob),
          imageDataUrl,
        }
      }),
    ).then((assets) => {
      const generatedAssets = assets.filter(
        (asset): asset is CustomerDocumentAsset => asset !== null,
      )

      if (cancelled) {
        generatedAssets.forEach((asset) => URL.revokeObjectURL(asset.pdfUrl))
        return
      }

      setCustomerDocumentAssets(generatedAssets)
      setIsGeneratingCustomerAssets(false)
    })

    return () => {
      cancelled = true
    }
  }, [viewingCustomer])

  useEffect(() => {
    return () => {
      customerDocumentAssets.forEach((asset) => {
        URL.revokeObjectURL(asset.pdfUrl)
      })
    }
  }, [customerDocumentAssets])

  const updateNewCustomer = <Key extends keyof CustomerForm>(
    key: Key,
    value: CustomerForm[Key],
  ) => {
    setNewCustomer((current) => ({ ...current, [key]: value }))
  }

  const copyDocumentImage = async (asset: CustomerDocumentAsset) => {
    try {
      setCopyFailedDocumentName(null)
      const imageBlob = await convertImageDataUrlToPng(asset.imageDataUrl)

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": imageBlob }),
      ])
      setCopiedDocumentName(asset.documentName)
      window.setTimeout(() => setCopiedDocumentName(null), 2000)
    } catch {
      setCopiedDocumentName(null)
      setCopyFailedDocumentName(asset.documentName)
      window.setTimeout(() => setCopyFailedDocumentName(null), 2500)
    }
  }

  const printPdfPreview = () => {
    if (!pdfPreviewUrl) {
      return
    }

    const printFrame = document.createElement("iframe")
    printFrame.src = pdfPreviewUrl
    printFrame.title = "打印 PDF"
    printFrame.style.position = "fixed"
    printFrame.style.width = "1px"
    printFrame.style.height = "1px"
    printFrame.style.opacity = "0"
    printFrame.style.pointerEvents = "none"

    printFrame.addEventListener("load", () => {
      printFrame.contentWindow?.focus()
      printFrame.contentWindow?.print()
      window.setTimeout(() => printFrame.remove(), 60_000)
    })

    document.body.appendChild(printFrame)
  }

  const selectRelativeDate = (dayOffset: number) => {
    const date = new Date()
    date.setDate(date.getDate() + dayOffset)
    setCreatedDate(date)
    setIsDateFilterOpen(false)
  }

  const renderPdfPreview = useCallback(async () => {
    const renderId = previewRenderId.current + 1
    previewRenderId.current = renderId

    if (!isCustomerFormValid) {
      setImagePreviewUrl(null)
      setPdfPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl)
        }

        return null
      })
      return
    }

    setIsRenderingPdf(true)

    try {
      if (!selectedTemplate) {
        throw new Error("未找到选中的 PDF 模板")
      }

      const { pdfBlob, imageDataUrl } = await createDocumentPdfBlob(
        newCustomer,
        selectedTemplate,
      )

      if (renderId !== previewRenderId.current) {
        return
      }

      const nextPdfPreviewUrl = URL.createObjectURL(pdfBlob)

      setPdfPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl)
        }

        return nextPdfPreviewUrl
      })
      setImagePreviewUrl(imageDataUrl)
    } catch (error) {
      if (renderId === previewRenderId.current) {
        console.error("PDF preview rendering failed", error)
      }
    } finally {
      if (renderId === previewRenderId.current) {
        setIsRenderingPdf(false)
      }
    }
  }, [isCustomerFormValid, newCustomer, selectedTemplate])

  useEffect(() => {
    if (!isDialogOpen) {
      previewRenderId.current += 1
      setIsRenderingPdf(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      void renderPdfPreview()
    }, 400)

    return () => window.clearTimeout(timeoutId)
  }, [isDialogOpen, renderPdfPreview])

  const filteredCustomers = customers.filter((customer) => {
    const matchesKeyword =
      customer.name.includes(keyword) ||
      customer.address.includes(keyword) ||
      customer.documents.some((document) => document.includes(keyword)) ||
      customer.notes.includes(keyword) ||
      customer.createdAt.includes(keyword)
    const matchesCreatedDate =
      !createdDate || customer.createdAt.startsWith(formatDateKey(createdDate))
    const matchesDocument =
      documentFilter === "all" || customer.documents.includes(documentFilter)

    return matchesKeyword && matchesCreatedDate && matchesDocument
  })
  const pageSizeNumber = Number(pageSize)
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / pageSizeNumber),
  )
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSizeNumber,
    currentPage * pageSizeNumber,
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [createdDate, documentFilter, keyword, pageSize])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">客户管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理客户资料、表文和供奉信息。
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    表文
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
                <span>
                  姓名 <span className="text-destructive">*</span>
                </span>
                <Input
                  required
                  value={newCustomer.name}
                  onChange={(event) => updateNewCustomer("name", event.target.value)}
                  placeholder="请输入姓名"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                <span>
                  详细地址 <span className="text-destructive">*</span>
                </span>
                <textarea
                  required
                  value={newCustomer.address}
                  onChange={(event) => updateNewCustomer("address", event.target.value)}
                  placeholder="请输入省、市、区及详细地址"
                  className="min-h-20 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                <span>
                  特供草香 <span className="text-destructive">*</span>
                </span>
                <div className="relative">
                  <Input
                    required
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
                  <Button type="button" disabled={!isCustomerFormValid}>
                    保存客户
                  </Button>
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
                  <div className="flex items-center gap-2 pr-8">
                    {pdfPreviewUrl ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={printPdfPreview}
                        >
                          <Printer className="mr-2 size-4" />
                          立即打印
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={pdfPreviewUrl} download={`${newCustomer.name || "客户"}-香供表文.pdf`}>
                            <Download className="mr-2 size-4" />
                            下载 PDF
                          </a>
                        </Button>
                      </>
                    ) : null}
                    {imagePreviewUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={renderPdfPreview}
                        disabled={isRenderingPdf}
                      >
                        <RefreshCw className="mr-2 size-4" />
                        {isRenderingPdf ? "渲染中" : "重新渲染"}
                      </Button>
                    ) : null}
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
                          请先填写姓名、详细地址和特供草香数量。
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={renderPdfPreview}
                        disabled={isRenderingPdf || !isCustomerFormValid}
                      >
                        <FileText className="mr-2 size-4" />
                        {isRenderingPdf ? "渲染中" : "渲染预览"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索姓名、地址、表文、备注或创建时间"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={documentFilter} onValueChange={setDocumentFilter}>
              <SelectTrigger className="h-10 w-40" aria-label="筛选表文">
                <SelectValue placeholder="选择表文" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部表文</SelectItem>
                <SelectItem value="香供表文">香供表文</SelectItem>
                <SelectItem value="布施表文">布施表文</SelectItem>
              </SelectContent>
            </Select>
            <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-44 justify-start font-normal"
                >
                  <CalendarDays className="mr-2 size-4" />
                  {createdDate
                    ? createdDate.toLocaleDateString("zh-CN")
                    : "选择创建日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={createdDate}
                  onSelect={(date) => {
                    setCreatedDate(date)
                    if (date) {
                      setIsDateFilterOpen(false)
                    }
                  }}
                />
                <div className="grid grid-cols-4 gap-1 border-t p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => selectRelativeDate(0)}
                  >
                    今天
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => selectRelativeDate(-1)}
                  >
                    昨天
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => selectRelativeDate(-2)}
                  >
                    前天
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCreatedDate(undefined)
                      setIsDateFilterOpen(false)
                    }}
                  >
                    全部
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {createdDate ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="清除创建日期"
                onClick={() => setCreatedDate(undefined)}
              >
                <X className="size-4" />
                <span className="sr-only">清除创建日期</span>
              </Button>
            ) : null}
          </div>
        </div>

        <TooltipProvider delayDuration={250}>
          <Table className="min-w-[880px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="px-4">姓名</TableHead>
                <TableHead className="px-4">详细地址</TableHead>
                <TableHead className="px-4">表文</TableHead>
                <TableHead className="px-4">备注</TableHead>
                <TableHead className="px-4">创建时间</TableHead>
                <TableHead className="px-4 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    没有符合当前筛选条件的客户
                  </TableCell>
                </TableRow>
              ) : null}
              {paginatedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="px-4 py-4">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-muted-foreground">{customer.id}</div>
                  </TableCell>
                  <TableCell className="max-w-xs px-4 py-4 text-muted-foreground">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          tabIndex={0}
                          className="block max-w-xs cursor-default truncate outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {customer.address}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-sm whitespace-normal break-words"
                      >
                        {customer.address}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="grid gap-1">
                      {customer.documents.map((document) => (
                        <div key={document}>
                          {document}
                          {document === "香供表文"
                            ? ` ｜ ${customer.incenseBundles} 捆`
                            : null}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs px-4 py-4 text-muted-foreground">
                    {customer.notes || "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                    {customer.createdAt}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingCustomer(customer)}
                    >
                      查看
                    </Button>
                    <Button variant="ghost" size="sm">
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            共 {filteredCustomers.length} 条记录
          </div>
          <div className="flex items-center gap-2">
            <Select value={pageSize} onValueChange={setPageSize}>
              <SelectTrigger className="h-9 w-28" aria-label="每页条数">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 条/页</SelectItem>
                <SelectItem value="20">20 条/页</SelectItem>
                <SelectItem value="50">50 条/页</SelectItem>
              </SelectContent>
            </Select>
            <span className="min-w-16 text-center text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="上一页"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">上一页</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="下一页"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">下一页</span>
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={viewingCustomer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setViewingCustomer(null)
          }
        }}
      >
        <DialogContent className="max-h-[calc(100vh-3rem)] max-w-3xl overflow-y-auto p-0">
          <DialogHeader>
            <div className="border-b px-6 py-5">
              <DialogTitle>客户详情</DialogTitle>
              <DialogDescription className="mt-1">
                查看客户信息、PDF 附件和表文图片。
              </DialogDescription>
            </div>
          </DialogHeader>

          {viewingCustomer ? (
            <dl className="mx-6 grid gap-x-8 gap-y-4 rounded-md border bg-muted/20 p-4 text-sm sm:grid-cols-2">
              <div className="grid gap-1">
                <dt className="text-muted-foreground">客户编号</dt>
                <dd className="font-medium">{viewingCustomer.id}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">姓名</dt>
                <dd className="font-medium">{viewingCustomer.name}</dd>
              </div>
              <div className="grid gap-1 sm:col-span-2">
                <dt className="text-muted-foreground">详细地址</dt>
                <dd className="break-words">{viewingCustomer.address}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">表文</dt>
                <dd className="grid gap-1">
                  {viewingCustomer.documents.map((document) => (
                    <div key={document}>
                      {document}
                      {document === "香供表文"
                        ? ` ｜ ${viewingCustomer.incenseBundles} 捆`
                        : null}
                    </div>
                  ))}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">创建时间</dt>
                <dd>{viewingCustomer.createdAt}</dd>
              </div>
              <div className="grid gap-1 sm:col-span-2">
                <dt className="text-muted-foreground">备注</dt>
                <dd className="break-words">{viewingCustomer.notes || "-"}</dd>
              </div>
            </dl>
          ) : null}

          <div className="px-6 pb-2 pt-1">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Paperclip className="size-4" />
                表文文件
              </h3>
              <span className="text-xs text-muted-foreground">
                PDF 附件与图片预览
              </span>
            </div>
            {isGeneratingCustomerAssets ? (
              <div className="flex h-40 items-center justify-center gap-2 rounded-md border bg-muted/20 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                正在生成表文文件
              </div>
            ) : null}
            {!isGeneratingCustomerAssets && customerDocumentAssets.length === 0 ? (
              <div className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
                暂无表文文件
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {customerDocumentAssets.map((asset) => (
                <div
                  key={asset.documentName}
                  className="overflow-hidden rounded-md border bg-background"
                >
                  <a
                    href={asset.imageDataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-muted/20 p-2 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    title="打开原图"
                  >
                    <img
                      src={asset.imageDataUrl}
                      alt={`${asset.documentName}预览`}
                      className="aspect-[1.414/1] w-full object-contain"
                    />
                  </a>
                  <div className="border-t p-3">
                    <div className="mb-3 text-sm font-medium">
                      {asset.documentName}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={asset.pdfUrl}
                          download={`${viewingCustomer?.name ?? "客户"}-${asset.documentName}.pdf`}
                        >
                          <Download className="mr-2 size-4" />
                          下载 PDF
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void copyDocumentImage(asset)}
                      >
                        {copiedDocumentName === asset.documentName ? (
                          <Check className="mr-2 size-4" />
                        ) : (
                          <Copy className="mr-2 size-4" />
                        )}
                        {copiedDocumentName === asset.documentName
                          ? "已复制"
                          : copyFailedDocumentName === asset.documentName
                            ? "复制失败"
                            : "复制图片"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        title="打开电脑微信"
                        onClick={() => window.location.assign("wechat://")}
                      >
                        <MessageCircle className="mr-2 size-4" />
                        打开微信
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <DialogClose asChild>
              <Button type="button">关闭</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

async function convertImageDataUrlToPng(imageDataUrl: string) {
  const image = new Image()
  image.src = imageDataUrl
  await image.decode()

  const canvas = document.createElement("canvas")
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Canvas rendering is not supported.")
  }

  context.drawImage(image, 0, 0)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error("Image conversion failed."))
      }
    }, "image/png")
  })
}

async function createDocumentPdfBlob(
  customer: CustomerForm,
  template: DocumentTemplate,
) {
  const sourcePdf = await getDocument({
    url: template.url,
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
  if (template.kind === "incense-offering") {
    drawCustomerInformation(context, canvas.width, canvas.height, customer)
  }

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

  context.font = `600 ${Math.round(48 * scaleY)}px "Songti SC", "STSong", serif`
  drawVerticalLine(
    context,
    `特供草香${customer.incenseBundles.trim() || "1"}捆`,
    1300 * scaleX,
    410 * scaleY,
    56 * scaleY,
  )

  context.font = `${Math.round(28 * scaleY)}px "Songti SC", "STSong", serif`
  const customerDetails = [
    `${name} 地址 ${address}`,
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
    36 * scaleY,
    44 * scaleX,
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
