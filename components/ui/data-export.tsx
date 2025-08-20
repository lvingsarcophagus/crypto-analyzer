    "use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  Database,
  Calendar,
  Check,
  Loader2,
  AlertCircle
} from "lucide-react"
import { useNotifications } from "@/components/ui/notifications"

interface ExportData {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  riskScore: number
  timestamp: string
  marketCap?: number
  volume?: number
  analysis?: any
}

interface DataExportProps {
  data: ExportData[]
  className?: string
  filename?: string
}

export function DataExport({ 
  data, 
  className = "",
  filename = "crypto-analysis" 
}: DataExportProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xlsx'>('json')
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'name', 'symbol', 'price', 'change24h', 'riskScore', 'timestamp'
  ])
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [isExporting, setIsExporting] = useState(false)
  const { addNotification } = useNotifications()

  const availableFields = [
    { key: 'name', label: 'Name', required: true },
    { key: 'symbol', label: 'Symbol', required: true },
    { key: 'price', label: 'Price', required: false },
    { key: 'change24h', label: '24h Change', required: false },
    { key: 'riskScore', label: 'Risk Score', required: false },
    { key: 'marketCap', label: 'Market Cap', required: false },
    { key: 'volume', label: 'Volume', required: false },
    { key: 'timestamp', label: 'Timestamp', required: false },
    { key: 'analysis', label: 'Analysis Data', required: false }
  ]

  const handleFieldToggle = (field: string, checked: boolean) => {
    if (checked) {
      setSelectedFields(prev => [...prev, field])
    } else {
      const fieldData = availableFields.find(f => f.key === field)
      if (!fieldData?.required) {
        setSelectedFields(prev => prev.filter(f => f !== field))
      }
    }
  }

  const filterDataByDate = (data: ExportData[]) => {
    if (dateRange === 'all') return data

    const now = new Date()
    const cutoff = new Date()
    
    switch (dateRange) {
      case 'today':
        cutoff.setHours(0, 0, 0, 0)
        break
      case 'week':
        cutoff.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoff.setMonth(now.getMonth() - 1)
        break
    }

    return data.filter(item => new Date(item.timestamp) >= cutoff)
  }

  const prepareExportData = () => {
    const filteredData = filterDataByDate(data)
    return filteredData.map(item => {
      const exportItem: any = {}
      selectedFields.forEach(field => {
        if (field in item) {
          exportItem[field] = (item as any)[field]
        }
      })
      return exportItem
    })
  }

  const downloadJSON = (data: any[], filename: string) => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const exportData = prepareExportData()
      
      if (exportData.length === 0) {
        addNotification({
          type: 'warning',
          title: 'No Data to Export',
          message: 'No data matches your filter criteria.',
        })
        return
      }

      const timestamp = new Date().toISOString().split('T')[0]
      const fullFilename = `${filename}-${timestamp}`

      switch (exportFormat) {
        case 'json':
          downloadJSON(exportData, fullFilename)
          break
        case 'csv':
          downloadCSV(exportData, fullFilename)
          break
        case 'xlsx':
          // For now, fallback to CSV for XLSX
          downloadCSV(exportData, fullFilename)
          addNotification({
            type: 'info',
            title: 'Format Note',
            message: 'XLSX export is currently saved as CSV format.',
          })
          break
      }

      addNotification({
        type: 'success',
        title: 'Export Successful',
        message: `Data exported as ${exportFormat.toUpperCase()} format.`,
      })

    } catch (error) {
      console.error('Export failed:', error)
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'An error occurred while exporting data.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json': return <Database className="h-4 w-4" />
      case 'csv': return <FileText className="h-4 w-4" />
      case 'xlsx': return <FileSpreadsheet className="h-4 w-4" />
      default: return <Download className="h-4 w-4" />
    }
  }

  const filteredCount = filterDataByDate(data).length

  return (
    <Card className={`${className} backdrop-blur-md bg-card/95 border-border/50`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Export Data
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Export your analysis data in various formats
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Export Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  JSON - Structured data
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV - Spreadsheet compatible
                </div>
              </SelectItem>
              <SelectItem value="xlsx">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  XLSX - Excel format
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </label>
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Data ({data.length} items)</SelectItem>
              <SelectItem value="today">Today Only</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          {filteredCount !== data.length && (
            <div className="text-xs text-muted-foreground">
              {filteredCount} items will be exported
            </div>
          )}
        </div>

        {/* Field Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Fields to Export</label>
          <div className="grid grid-cols-2 gap-2">
            {availableFields.map(field => (
              <div key={field.key} className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={selectedFields.includes(field.key)}
                  onCheckedChange={(checked) => handleFieldToggle(field.key, !!checked)}
                  disabled={field.required}
                />
                <label 
                  htmlFor={field.key} 
                  className="text-sm cursor-pointer flex items-center gap-1"
                >
                  {field.label}
                  {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                </label>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedFields.length} fields selected
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-card/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            Export Summary
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Format: {exportFormat.toUpperCase()}</div>
            <div>Records: {filteredCount}</div>
            <div>Fields: {selectedFields.length}</div>
            <div>Size: ~{Math.round(filteredCount * selectedFields.length * 0.1)}KB</div>
          </div>
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport}
          disabled={isExporting || filteredCount === 0 || selectedFields.length === 0}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              {getFormatIcon(exportFormat)}
              <span className="ml-2">Export {exportFormat.toUpperCase()}</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
