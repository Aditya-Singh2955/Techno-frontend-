"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CandidateProfileView } from "@/components/candidate-profile"
import { CompanyProfileView } from "@/components/company-profile"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://techno-backend-a0s0.onrender.com/api/v1'

export default function AdminUserDetailPage() {
  const params = useParams() as { userType: string; id: string }
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`${API_BASE_URL}/admin/users/${params.userType}/${params.id}/profile`)
        const result = await response.json()
        
        if (result.success) {
          setUserData(result.data)
        } else {
          setError(result.message || "Failed to load user profile")
        }
      } catch (e) {
        console.error("Error fetching user profile:", e)
        setError("Failed to load user details")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.userType && params.id) {
      fetchUserProfile()
    }
  }, [params.userType, params.id])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center gap-3 text-gray-600">
        <LoadingSpinner size={32} />
        Loading profile…
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-gray-700">
        <div>{error || "User not found"}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-md border"
        >
          Go back
        </button>
      </div>
    )
  }

  // Map API shape to read-only view props
  if (params.userType === "jobseeker") {
    const candidate = {
      name: userData.fullName || "N/A",
      email: userData.email || "N/A",
      phone: userData.phoneNumber || "N/A",
      location: userData.location || "N/A",
      dateOfBirth: userData.dateOfBirth || "N/A",
      nationality: userData.nationality || "N/A",
      summary: userData.professionalSummary || "N/A",
      currentRole: userData.currentRole || "N/A",
      company: userData.company || "N/A",
      experience: (userData.yearsOfExperience?.toString?.() || "0") + " years",
      industry: userData.industry || "N/A",
      degree: userData.highestDegree || "N/A",
      institution: userData.institution || "N/A",
      year: userData.yearOfGraduation || "N/A",
      grade: userData.gradeCgpa || "N/A",
      skills: Array.isArray(userData.skills) ? userData.skills.join(", ") : (userData.skills || "N/A"),
      certifications: Array.isArray(userData.certifications) ? userData.certifications.join(", ") : (userData.certifications || "N/A"),
      jobType: userData.jobType || "N/A",
      salaryExpectation: userData.salaryExpectation || "N/A",
      preferredLocation: userData.preferredLocation || "N/A",
      availability: userData.availability || "N/A",
      appliedFor: "", // Remove for admin view
      appliedDate: "", // Remove for admin view
      status: userData.loginStatus || "Active",
      resumeFilename: userData.resumeFilename || "N/A",
      coverLetter: userData.coverLetter || "N/A",
      documentsList: userData.documentsList || [],
      rating: userData.rating || 0,
      tier: userData.tier || "Blue",
    }
    return <CandidateProfileView candidate={candidate} />
  }

  // Employer view
  const company = {
    companyName: userData.companyName || "N/A",
    industry: userData.industry || "N/A",
    teamSize: userData.teamSize || "N/A",
    foundedYear: (userData.foundedYear?.toString?.() || "N/A"),
    about: userData.about || "N/A",
    location: {
      city: userData.city || "N/A",
      country: userData.country || "N/A",
      officeAddress: userData.officeAddress || "N/A",
    },
    website: userData.website || "N/A",
    verified: Boolean(userData.verificationStatus === 'verified'),
    logo: userData.companyLogo || "",
    specialties: userData.specialties || [],
    achievements: userData.achievements || [],
    workCulture: userData.workCulture || [],
    socialLinks: userData.socialLinks || {},
    activeJobsCount: userData.activeJobsCount || 0,
    totalJobsPosted: userData.totalJobsPosted || 0,
    memberSince: userData.memberSince ? new Date(userData.memberSince).toLocaleDateString() : "N/A",
  }
  return <CompanyProfileView company={company} />
}


