"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, MapPin, DollarSign, Calendar, Briefcase } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { EmployerProfileCompletionDialog } from "@/components/ui/employer-profile-completion-dialog"

export default function PostJobPage() {
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    location: "",
    jobType: "",
    salaryMin: "",
    salaryMax: "",
    experience: "",
    skills: "",
    description: "",
    requirements: "",
    deadline: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [profileCompletionResult, setProfileCompletionResult] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to post a job.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      // Check employer profile eligibility first
      console.log('🏢 Checking employer profile eligibility...')
      const eligibilityResponse = await axios.get('https://techno-backend-a0s0.onrender.com/api/v1/employer/eligibility', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }).catch((error) => {
        console.error('❌ EMPLOYER ELIGIBILITY API ERROR:', error.response?.status, error.response?.data || error.message);
        return null;
      });

      console.log('📡 EMPLOYER ELIGIBILITY Response:', eligibilityResponse?.data);

      if (!eligibilityResponse?.data?.success) {
        toast({
          title: "Profile Check Error",
          description: "Unable to check your company profile eligibility. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const eligibilityData = eligibilityResponse.data.data;

      // Set profile completion data for the dialog
      setProfileCompletion(eligibilityData.profileCompletion.percentage);
      setProfileCompletionResult({
        percentage: eligibilityData.profileCompletion.percentage,
        canPostJob: eligibilityData.canPostJob,
        missingFields: eligibilityData.profileCompletion.missingFields,
        companyName: eligibilityData.companyInfo.companyName
      });

      console.log('✅ EMPLOYER ELIGIBILITY RESULT:', {
        canPostJob: eligibilityData.canPostJob,
        profilePercentage: eligibilityData.profileCompletion.percentage,
        missingFields: eligibilityData.profileCompletion.missingFields
      });

      if (!eligibilityData.canPostJob) {
        setShowProfileDialog(true);
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post('https://techno-backend-a0s0.onrender.com/api/v1/create/jobs', {
        title: formData.jobTitle,
        companyName: formData.company,
        location: formData.location,
        jobType: [formData.jobType],
        salary: {
          min: parseFloat(formData.salaryMin) || 0,
          max: parseFloat(formData.salaryMax) || 0,
        },
        experienceLevel: formData.experience,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        description: formData.description,
        requirements: formData.requirements.split('\n').map(req => req.trim()).filter(req => req),
        applicationDeadline: formData.deadline,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      toast({
        title: "Job Posted Successfully!",
        description: "Your job posting is now live and visible to job seekers.",
      })

      setFormData({
        jobTitle: "",
        company: "",
        location: "",
        jobType: "",
        salaryMin: "",
        salaryMax: "",
        experience: "",
        skills: "",
        description: "",
        requirements: "",
        deadline: "",
      })

      // Optionally redirect to the dashboard or job listing page
      setTimeout(() => {
        router.push('/employer/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Error posting job:', error)
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to post job. Please try again.'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center card-shadow">
                <PlusCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Post a Job</h1>
                <p className="text-gray-600 text-lg">Create a new job posting to attract top talent</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-3 text-emerald-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>Essential details about the position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => handleChange("jobTitle", e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      placeholder="Your company name"
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        placeholder="Dubai, UAE"
                        className="h-11 pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type *</Label>
                    <Select value={formData.jobType} onValueChange={(value) => handleChange("jobType", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full Time">Full Time</SelectItem>
                        <SelectItem value="Part Time">Part Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level *</Label>
                    <Select value={formData.experience} onValueChange={(value) => handleChange("experience", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                        <SelectItem value="executive">Executive Level (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-3 text-emerald-600" />
                  Compensation
                </CardTitle>
                <CardDescription>Salary range and benefits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Minimum Salary (AED) *</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => handleChange("salaryMin", e.target.value)}
                      placeholder="8000"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Maximum Salary (AED) *</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => handleChange("salaryMax", e.target.value)}
                      placeholder="15000"
                      className="h-11"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>Detailed description and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleChange("requirements", e.target.value)}
                    placeholder="List the required qualifications, experience, and skills..."
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleChange("skills", e.target.value)}
                    placeholder="e.g., React, Node.js, Project Management (comma-separated)"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button type="submit" disabled={isSubmitting} className="gradient-bg text-white px-12 py-3 text-lg h-12">
                {isSubmitting ? "Posting Job..." : "Post Job"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Profile Completion Dialog */}
      <EmployerProfileCompletionDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        completionPercentage={profileCompletion}
        canPostJob={profileCompletionResult?.canPostJob || false}
        missingFields={profileCompletionResult?.missingFields || []}
        companyName={profileCompletionResult?.companyName}
        onCompleteProfile={() => {
          setShowProfileDialog(false)
          router.push('/employer/profile')
        }}
      />
    </div>
  )
}
