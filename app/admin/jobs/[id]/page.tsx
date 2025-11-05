"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, MapPin, DollarSign, Calendar, Briefcase, Building, Users, Clock } from "lucide-react"
import { toast } from "sonner"

interface JobDetails {
  id: string
  jobTitle: string
  companyName: string
  location: string
  jobType: string
  minimumSalary: number
  maximumSalary: number
  applicationDeadline: string
  status: string
  description: string
  requirements: string[]
  benefits: string[]
  skills: string[]
  views: number
  employerInfo: {
    name: string
    email: string
    logo?: string
  } | null
  postedDate: string
  lastUpdated: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export default function AdminJobDetailPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('Fetching job details for ID:', params.id)
        console.log('API URL:', `${API_BASE_URL}/admin/jobs/${params.id}`)
        
        const response = await fetch(`${API_BASE_URL}/admin/jobs/${params.id}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Response error:', errorText)
          throw new Error(`Failed to fetch job details: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('Response data:', result)
        
        if (result.success) {
          setJobDetails(result.data)
        } else {
          throw new Error(result.message || 'Failed to load job details')
        }
      } catch (err) {
        console.error('Error fetching job details:', err)
        setError('Failed to load job details')
        toast.error('Failed to load job details')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchJobDetails()
    }
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatSalary = (min: number, max: number) => {
    if (min === 0 && max === 0) return 'Not specified'
    if (min === max) return `$${min.toLocaleString()}`
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center gap-3 text-gray-600">
        <LoadingSpinner size={32} />
        Loading job details…
      </div>
    )
  }

  if (error || !jobDetails) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-gray-700">
        <div>{error || "Job not found"}</div>
        <Button onClick={() => router.back()} variant="outline">
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{jobDetails.jobTitle}</h1>
              <p className="text-gray-600 text-lg">{jobDetails.companyName}</p>
            </div>
            <Badge className={`${getStatusColor(jobDetails.status)} px-3 py-1 text-sm font-medium`}>
              {jobDetails.status.charAt(0).toUpperCase() + jobDetails.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Job Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block">Location</span>
                    <span className="font-medium text-gray-900">{jobDetails.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block">Job Type</span>
                    <span className="font-medium text-gray-900">{jobDetails.jobType}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block">Salary</span>
                    <span className="font-medium text-gray-900">{formatSalary(jobDetails.minimumSalary, jobDetails.maximumSalary)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block">Application Deadline</span>
                    <span className="font-medium text-gray-900">{jobDetails.applicationDeadline}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{jobDetails.description}</p>
            </CardContent>
          </Card>

          {/* Requirements */}
          {jobDetails.requirements && jobDetails.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {jobDetails.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {jobDetails.skills && jobDetails.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {jobDetails.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {jobDetails.benefits && jobDetails.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {jobDetails.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Job Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm text-gray-600 block">Total Views</span>
                  <span className="font-medium text-gray-900 text-lg">{jobDetails.views}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <span className="text-sm text-gray-600 block">Posted Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(jobDetails.postedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <span className="text-sm text-gray-600 block">Last Updated</span>
                  <span className="font-medium text-gray-900">
                    {new Date(jobDetails.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employer Info */}
          {jobDetails.employerInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Employer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block">Company Name</span>
                    <span className="font-medium text-gray-900">{jobDetails.employerInfo.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block">Contact Email</span>
                    <span className="font-medium text-gray-900">{jobDetails.employerInfo.email}</span>
                  </div>
                </div>
                {jobDetails.employerInfo.logo && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block">Company Logo</span>
                      <img 
                        src={jobDetails.employerInfo.logo} 
                        alt="Company Logo" 
                        className="w-16 h-16 object-contain mt-2 rounded-lg border"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}