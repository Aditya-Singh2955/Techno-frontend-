"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Loader2, CheckCircle, XCircle, User, Mail, Phone, Calendar, MapPin, Briefcase, GraduationCap, Settings, FileText, Award } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { FileUpload } from "@/components/file-upload"

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: string[];
  salary: {
    min: number;
    max: number;
  };
  requirements: string[];
  skills: string[];
  description: string;
  experienceLevel: string;
  applicationDeadline: string;
}

interface ReferralForm {
  // Personal Information
  friendName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  
  // Professional Experience
  currentCompany: string
  expectedSalary: string
  location: string
  
  // Education
  education: string
  
  // Skills & Certifications
  skills: string
  certifications: string
  
  // Resume
  cvFile: File | null
  resumeUrl: string
}

export default function ReferFriendPage({ params }: { params: Promise<{ jobId: string }> }) {
  const [formData, setFormData] = useState<ReferralForm>({
    friendName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    currentCompany: "",
    expectedSalary: "",
    location: "",
    education: "",
    skills: "",
    certifications: "",
    cvFile: null,
    resumeUrl: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [matchResult, setMatchResult] = useState<{ success: boolean; message: string } | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Handle async params and fetch job data
  useEffect(() => {
    const getJobDetails = async () => {
      try {
        const resolvedParams = await params
        const id = resolvedParams.jobId
        setJobId(id)
        
        // Fetch job data from API
        const response = await axios.get(`http://localhost:4000/api/v1/jobs/${id}`)
        if (response.data && response.data.data) {
          setJob(response.data.data)
        } else {
          console.error('Job not found')
          setJob(null)
        }
      } catch (error) {
        console.error('Error loading job details:', error)
        setJob(null)
      } finally {
        setLoading(false)
      }
    }
    
    getJobDetails()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="card-shadow border-0">
            <CardContent className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading job details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="card-shadow border-0">
            <CardContent className="p-6 text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-4">Job Not Found</h1>
              <p className="text-gray-600 mb-4">The job you're trying to refer for doesn't exist.</p>
              <Button onClick={() => router.push("/jobseeker/search")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: keyof ReferralForm, value: string | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }


  const validateForm = (): boolean => {
    const requiredFields = ['friendName', 'email', 'phone', 'currentCompany', 'expectedSalary', 'dateOfBirth', 'location', 'nationality', 'skills']
    
    for (const field of requiredFields) {
      if (!formData[field as keyof ReferralForm]) {
        toast({
          title: "Missing required field",
          description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`,
          variant: "destructive",
        })
        return false
      }
    }

    if (!formData.resumeUrl) {
      toast({
        title: "Resume Required",
        description: "Please upload your friend's resume.",
        variant: "destructive",
      })
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Mock AI matching logic
  const performAIMatching = (): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate AI matching based on job requirements and form data
        const matchScore = Math.random() * 100 // 0-100
        
        if (matchScore >= 80) {
          resolve({
            success: true,
            message: "Your friend's profile is a strong match for this role. We'll notify you when there's an update."
          })
        } else {
          resolve({
            success: false,
            message: "Your friend's profile didn't meet the job requirements. Try referring for a different opportunity."
          })
        }
      }, 2000) // Simulate processing time
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to refer a friend.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      // Submit referral application to backend
      const response = await axios.post('http://localhost:4000/api/v1/applications/referral', {
        jobId,
        friendName: formData.friendName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        currentCompany: formData.currentCompany,
        expectedSalary: formData.expectedSalary,
        location: formData.location,
        education: formData.education,
        skills: formData.skills,
        certifications: formData.certifications,
        resumeUrl: formData.resumeUrl
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data) {
        setMatchResult({
          success: true,
          message: "Your friend's application has been submitted successfully! They can now login with their email to track the application status."
        })
        setShowResult(true)
        
        toast({
          title: "Referral Submitted",
          description: "Your friend's application has been created successfully.",
        })
      }
      
    } catch (error: any) {
      console.error('Referral submission error:', error)
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again."
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showResult && matchResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="card-shadow border-0">
            <CardContent className="p-8 text-center">
              {matchResult.success ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}
              
              <h1 className="text-2xl font-bold mb-4">
                {matchResult.success ? "🎉 Referral Submitted Successfully!" : "😔 Not a Match This Time"}
              </h1>
              
              <p className="text-gray-600 mb-6">{matchResult.message}</p>
              
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push("/jobseeker/search")}>
                  Browse More Jobs
                </Button>
                <Button variant="outline" onClick={() => setShowResult(false)}>
                  Refer Another Friend
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 flex items-center gap-2 mb-6">
            <Link href="/jobseeker/search" className="hover:underline">Jobs</Link>
            <span>➔</span>
            <Link href={`/jobseeker/search/${jobId}`} className="hover:underline">{job.title}</Link>
            <span>➔</span>
            <span className="text-gray-700 font-medium">Refer Friend</span>
          </nav>

          {/* Job Info Card */}
          <Card className="card-shadow border-0 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-blue-900 mb-2">Refer a Friend for: {job.title}</h1>
                  <p className="text-blue-700">{job.companyName} • {job.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {job.jobType?.join(', ') || 'Full-time'}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      AED {job.salary?.min?.toLocaleString()} - {job.salary?.max?.toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-blue-700 border-blue-300">
                      {job.experienceLevel}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <Award className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-700">Referral Bonus Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Personal Information */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>Basic details about your friend</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="friendName">Friend's Full Name *</Label>
                    <Input
                      id="friendName"
                      value={formData.friendName}
                      onChange={(e) => handleInputChange('friendName', e.target.value)}
                      placeholder="Enter friend's full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email ID *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="friend@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Dubai, UAE"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UAE">UAE</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="Pakistan">Pakistan</SelectItem>
                        <SelectItem value="Philippines">Philippines</SelectItem>
                        <SelectItem value="Egypt">Egypt</SelectItem>
                        <SelectItem value="Jordan">Jordan</SelectItem>
                        <SelectItem value="Lebanon">Lebanon</SelectItem>
                        <SelectItem value="Syria">Syria</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Professional Experience */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                  Professional Experience
                </CardTitle>
                <CardDescription>Your friend's current work experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentCompany">Current Company *</Label>
                    <Input
                      id="currentCompany"
                      value={formData.currentCompany}
                      onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                      placeholder="Where is your friend currently working?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedSalary">Expected Salary (AED) *</Label>
                    <Input
                      id="expectedSalary"
                      type="number"
                      value={formData.expectedSalary}
                      onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                      placeholder="15000"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Education */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                  Education
                </CardTitle>
                <CardDescription>Your friend's educational background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="education">Highest Education Qualification</Label>
                  <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select highest qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor's">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master's">Master's Degree</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Skills & Certifications */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="w-4 h-4 mr-2 text-blue-600" />
                  Skills & Certifications
                </CardTitle>
                <CardDescription>Your friend's key skills and professional certifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Key Skills *</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    placeholder="List your friend's key skills (comma-separated)"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    placeholder="List your friend's certifications and licenses (optional)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Resume Upload */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Resume Upload
                </CardTitle>
                <CardDescription>Upload your friend's resume and other relevant documents</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onUploadSuccess={(fileData) => {
                    setFormData(prev => ({
                      ...prev,
                      resumeUrl: fileData.secure_url || fileData.url
                    }));
                    toast({
                      title: "Resume Uploaded",
                      description: "Your friend's resume has been uploaded successfully.",
                    });
                  }}
                  onUploadError={(error) => {
                    console.error("Resume upload error:", error);
                    toast({
                      title: "Upload Failed",
                      description: error,
                      variant: "destructive",
                    });
                  }}
                  accept=".pdf,.doc,.docx"
                  maxSize={5}
                  allowedTypes={['document']}
                  placeholder="Upload Your Friend's Resume"
                  currentFile={formData.resumeUrl ? "Resume uploaded" : null}
                />
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="gradient-bg text-white flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Referral"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/jobseeker/search/${jobId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 