"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, UserCheck, FileText, Star, ArrowRight, Award, Trophy, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const membershipTiers = [
  {
    name: "Blue",
    minPoints: 0,
    icon: Star,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    desc: "0–4 Years Experience",
  },
  {
    name: "Silver",
    minPoints: 150,
    icon: Trophy,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    desc: ">=5 Years Experience + Emirates ID",
  },
  {
    name: "Gold",
    minPoints: 250,
    icon: Award,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    desc: "Emirati National or >=10 Years Experience",
  },
  {
    name: "Platinum",
    minPoints: 350,
    icon: Gift,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    desc: "Actively uses platform or purchases Premium Services",
  },
]

export default function JobSeekerRewardsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State for user data
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userPoints, setUserPoints] = useState(0)
  const [referralPoints, setReferralPoints] = useState(0)
  const [activityPoints, setActivityPoints] = useState(0)
  const [userTier, setUserTier] = useState("Blue")
  const [profileCompletion, setProfileCompletion] = useState(0)

  // Get auth headers function
  const getAuthHeaders = (): Record<string, string> => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
    }
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Calculate profile completion and points (same logic as other pages)
  const calculateProfileMetrics = (profile: any) => {
    let completed = 0;
    const totalFields = 24; // employmentVisa removed

    // Personal Info (9 fields - employmentVisa removed)
    if (profile?.fullName) completed++;
    if (profile?.email) completed++;
    if (profile?.phoneNumber) completed++;
    if (profile?.location) completed++;
    if (profile?.dateOfBirth) completed++;
    if (profile?.nationality) completed++;
    if (profile?.professionalSummary) completed++;
    if (profile?.emirateId) completed++;
    if (profile?.passportNumber) completed++;

    // Experience (4 fields)
    const exp = profile?.professionalExperience?.[0];
    if (exp?.currentRole) completed++;
    if (exp?.company) completed++;
    if (exp?.yearsOfExperience) completed++;
    if (exp?.industry) completed++;

    // Education (4 fields)
    const edu = profile?.education?.[0];
    if (edu?.highestDegree) completed++;
    if (edu?.institution) completed++;
    if (edu?.yearOfGraduation) completed++;
    if (edu?.gradeCgpa) completed++;

    // Skills, Preferences, Certifications, Resume (4 fields)
    if (profile?.skills && profile.skills.length > 0) completed++;
    if (profile?.jobPreferences?.preferredJobType && profile.jobPreferences.preferredJobType.length > 0) completed++;
    if (profile?.certifications && profile.certifications.length > 0) completed++;
    if (profile?.jobPreferences?.resumeAndDocs && profile.jobPreferences.resumeAndDocs.length > 0) completed++;

    // Social Links (3 fields)
    if (profile?.socialLinks?.linkedIn) completed++;
    if (profile?.socialLinks?.instagram) completed++;
    if (profile?.socialLinks?.twitterX) completed++;

    const percentage = Math.round((completed / totalFields) * 100);
    const calculatedPoints = 50 + percentage * 2; // Base 50 + 2 points per percentage (100% = 250 points)
    const applicationPoints = profile?.rewards?.applyForJobs || 0; // Points from job applications
    const rmServicePoints = profile?.rewards?.rmService || 0; // Points from RM service purchase
    const deductedPoints = profile?.deductedPoints || 0;
    const totalPoints = calculatedPoints + applicationPoints + rmServicePoints;
    const availablePoints = Math.max(0, totalPoints - deductedPoints);

    return { percentage, points: availablePoints };
  };

  // Determine user tier based on points and profile
  const determineUserTier = (profile: any, points: number) => {
    const yearsExp = profile?.professionalExperience?.[0]?.yearsOfExperience || 0;
    const isEmirati = profile?.nationality?.toLowerCase()?.includes("emirati");
    const hasEmiratesId = !!profile?.emirateId;

    if (points >= 500) return "Platinum";
    else if (isEmirati || yearsExp >= 10) return "Gold";
    else if (yearsExp >= 5 && hasEmiratesId) return "Silver";
    else if (yearsExp <= 4) return "Blue";
    else return "Silver";
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('https://techno-backend-a0s0.onrender.com/api/v1/profile/details', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUserProfile(data.data);
      
      // Calculate metrics
      const metrics = calculateProfileMetrics(data.data);
      setProfileCompletion(metrics.percentage);
      setUserPoints(metrics.points);
      
      // Calculate referral and activity points
      const referralRewardPoints = data.data.referralRewardPoints || 0;
      const activityRewardPoints = metrics.points - referralRewardPoints;
      
      setReferralPoints(referralRewardPoints);
      setActivityPoints(Math.max(0, activityRewardPoints));
      
      // Determine tier
      const tier = determineUserTier(data.data, metrics.points);
      setUserTier(tier);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    fetchUserProfile();
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Calculate tier and progress
  const currentTier = membershipTiers.find((t) => t.name === userTier) || membershipTiers[0];
  const nextTier = membershipTiers.find((t) => t.minPoints > userPoints);
  const progressToNext = nextTier
    ? ((userPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading your rewards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        {/* Header: Points & Tier - Improved Responsive Layout */}
        <Card
          className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-[#eaf3ff] to-white mb-8"
          style={{ padding: 0 }}
        >
          <CardContent className="flex flex-col md:flex-row items-stretch md:items-center w-full p-0">
            {/* Left Section: Icon + Info + Cards */}
            <div className="flex flex-col justify-center flex-1 px-8 py-8 md:py-10">
              <div className="flex flex-row items-center gap-6 mb-4">
                {/* Trophy Icon */}
                <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md">
                  <Trophy className="w-10 h-10 text-yellow-500" />
                </div>
                {/* Main Info Stack */}
                <div className="flex flex-col items-start justify-center">
                  <h1 className="font-extrabold mb-1 text-4xl md:text-5xl text-blue-900 leading-tight">{userPoints} Points</h1>
                  <span className="mb-1 bg-white text-blue-900 font-semibold rounded-full px-6 py-2 text-base shadow-sm" style={{marginBottom:4}}>
                    {userTier} Member
                  </span>
                  <div className="text-gray-500 text-sm mb-1">
                    {nextTier ? `${nextTier.minPoints - userPoints} points to ${nextTier.name}` : "Maximum tier reached!"}
                  </div>
                </div>
              </div>
              {/* Bottom Card Row: Referral + Activity */}
              <div className="flex flex-row gap-4 mt-2 w-full max-w-md">
                {/* Referral Points Card */}
                <div className="flex-1 bg-blue-50 rounded-xl shadow-md flex items-center px-5 py-4 min-w-0">
                  <span className="text-2xl mr-4">🎁</span>
                  <span className="font-medium text-blue-900 text-base flex-1">Referral Reward Points</span>
                  <span className="font-bold text-blue-800 text-lg ml-2">{referralPoints}</span>
                </div>
                {/* Activity Points Card */}
                <div className="flex-1 bg-emerald-50 rounded-xl shadow-md flex items-center px-5 py-4 min-w-0">
                  <span className="text-2xl mr-4">📝</span>
                  <span className="font-medium text-emerald-900 text-base flex-1">Activity Points</span>
                  <span className="font-bold text-emerald-800 text-lg ml-2">{activityPoints}</span>
                </div>
              </div>
            </div>
            {/* Right Section: Progress Bar */}
            <div className="flex flex-col justify-center items-center md:items-end w-full md:w-2/5 px-8 py-8 md:py-10">
              <div className="w-full max-w-xs md:max-w-sm">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{currentTier.name}</span>
                  <span>{nextTier ? nextTier.name : "Max"}</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full relative overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Earn Points */}
        <Card className="card-shadow border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              How to Earn Points
            </CardTitle>
            <CardDescription>Boost your points by being active on the platform</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              <span>Complete your profile</span>
              <Badge className="bg-emerald-100 text-emerald-800 ml-2">+100</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Apply for jobs</span>
              <Badge className="bg-blue-100 text-blue-800 ml-2">+20/job</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Gift className="w-6 h-6 text-pink-600" />
              <span>Refer a friend</span>
              <Badge className="bg-pink-100 text-pink-800 ml-2">+50</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <ArrowRight className="w-6 h-6 text-purple-600" />
              <span>Purchase premium services</span>
              <Badge className="bg-purple-100 text-purple-800 ml-2">+variable</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Earn Money Card */}
        <Card className="card-shadow border-0 mb-8 cursor-pointer hover:shadow-lg transition">
          <CardHeader className="bg-gradient-to-r from-emerald-400 to-blue-400 rounded-t-2xl p-6 text-white text-center">
            <CardTitle className="text-2xl font-bold mb-1">Earn up to 10,000 AED</CardTitle>
            <CardDescription className="text-lg text-white/90">by referring someone to job openings</CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-gray-700 text-base mb-2">Refer candidates to jobs on Findr. If your referral is hired, you earn a cash reward!</p>
            <p className="text-gray-600 text-sm mb-4">Click to learn more about how you can earn money through our referral program.</p>
            <Link href="/rewards/jobseeker/earn-money">
              <Badge className="bg-emerald-600 text-white px-4 py-2 text-base cursor-pointer">Learn More</Badge>
            </Link>
          </CardContent>
        </Card>

        {/* Redeemable Rewards */}
        <Card className="card-shadow border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Gift className="w-5 h-5 mr-2 text-emerald-600" />
              Redeem Your Points
            </CardTitle>
            <CardDescription>Use your points for exclusive benefits</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <h3 className="font-semibold mb-1">Resume Building Discounts</h3>
              <p className="text-gray-600 text-sm mb-2">Get professional help to craft your resume at a discounted rate.</p>
              <Badge className="bg-emerald-100 text-emerald-800">Available</Badge>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-semibold mb-1">Visa Consultation Discounts</h3>
              <p className="text-gray-600 text-sm mb-2">Redeem points for discounts on expert visa consultation services.</p>
              <Badge className="bg-blue-100 text-blue-800">Available</Badge>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
              <h3 className="font-semibold mb-1">Mobility Assistance</h3>
              <p className="text-gray-600 text-sm mb-2">Use your points for help with relocation and mobility support.</p>
              <Badge className="bg-pink-100 text-pink-800">Available</Badge>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="font-semibold mb-1">Premium Membership Upgrades</h3>
              <p className="text-gray-600 text-sm mb-2">Upgrade to premium tiers and unlock more features.</p>
              <Badge className="bg-purple-100 text-purple-800">Available</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Membership Tiers */}
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Membership Tiers</CardTitle>
            <CardDescription>Unlock more benefits as you earn points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {membershipTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`p-6 rounded-lg border-2 ${tier.name === userTier ? tier.border : "border-gray-200"} ${tier.name === userTier ? tier.bg : "bg-gray-50"}`}
                >
                  <div className="text-center">
                    <tier.icon className={`w-10 h-10 mx-auto mb-3 ${tier.color}`} />
                    <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                    {/* Removed subtitle and points */}
                    {tier.name === userTier && <Badge className="gradient-bg text-white">Current Tier</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 