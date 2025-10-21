"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AdminDataTable } from "@/components/admin-data-table"
import { mockApplications } from "@/lib/admin-mock-data"
import { Application } from "@/lib/admin-types"
import { useRouter } from "next/navigation"
import { Eye, Download } from "lucide-react"
import * as XLSX from 'xlsx'

export default function AdminApplicationsPage() {
  const router = useRouter()

  const columns = [
    { key: 'id', label: 'Application ID', sortable: true },
    { key: 'candidate', label: 'Candidate', sortable: true },
    { key: 'jobTitle', label: 'Job Title', sortable: true },
  ]

  const handleExportToExcel = () => {
    const workbook = XLSX.utils.book_new()
    const worksheetData = [
      ['Application ID', 'Candidate', 'Job Title'],
      ...mockApplications.map(app => [app.id, app.candidate, app.jobTitle])
    ]
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications')
    
    const filename = `Applications_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, filename)
  }

  const handleViewMore = (application: Application) => {
    router.push(application.applicationUrl)
  }

  const renderActions = (application: Application) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleViewMore(application)}
      className="flex items-center gap-1"
    >
      <Eye className="w-3 h-3" />
      View More
    </Button>
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Applications Management</h1>
          <p className="text-sm md:text-base text-gray-600">View and manage all job applications</p>
        </div>
        <Button
          onClick={handleExportToExcel}
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export to Excel</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      <AdminDataTable
        data={mockApplications}
        columns={columns}
        actions={renderActions}
      />
    </div>
  )
}
