"use client"
import React, { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Trash2, BadgePercent } from "lucide-react"

export default function CartPage() {
  const [rewardPoints, setRewardPoints] = useState(0)
  const [userPoints, setUserPoints] = useState(0)
  const [coupon, setCoupon] = useState("")
  const [cart, setCart] = useState([{ name: "Virtual RM Service", desc: "Dedicated Relationship Manager for your job search journey.", price: 4999 }])
  const [removed, setRemoved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Calculate profile points (same logic as dashboard)
  const calculateProfilePoints = (profile: any) => {
    let completed = 0;
    const totalFields = 25; // Same as dashboard

    // Personal Info (10 fields)
    if (profile?.fullName) completed++;
    if (profile?.email) completed++;
    if (profile?.phoneNumber) completed++;
    if (profile?.location) completed++;
    if (profile?.dateOfBirth) completed++;
    if (profile?.nationality) completed++;
    if (profile?.professionalSummary) completed++;
    if (profile?.emirateId) completed++;
    if (profile?.passportNumber) completed++;
    if (profile?.employmentVisa) completed++;

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
    const calculatedPoints = 50 + percentage * 2; // Base 50 + 2 points per percentage
    const deductedPoints = profile?.deductedPoints || 0;
    const availablePoints = Math.max(0, calculatedPoints - deductedPoints);

    return availablePoints;
  };

  // Fetch user's points on component mount
  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view your points.",
            variant: "destructive",
          })
          router.push('/login')
          return
        }

        const response = await fetch('http://localhost:4000/api/v1/profile/details', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        if (data.success && data.data) {
          // Use the same calculation logic as dashboard
          const calculatedPoints = calculateProfilePoints(data.data)
          setUserPoints(calculatedPoints)
        }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your points balance.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
    }

    fetchUserPoints()
  }, [router, toast])

  const AED_PRICE = 2500;
  const subtotal = cart.length > 0 ? AED_PRICE : 0;
  const pointsDiscount = rewardPoints * 1; // 1 point = 1 AED
  const total = Math.max(subtotal - pointsDiscount, 0);

  const handleRemove = () => {
    setCart([])
    setRemoved(true)
    toast({ title: "Removed from cart", description: "Virtual RM Service removed." })
  }

  const handlePointsChange = (value: number) => {
    if (value > userPoints) {
      toast({
        title: "Insufficient Points",
        description: `You only have ${userPoints} points available.`,
        variant: "destructive",
      })
      return
    }
    if (value < 0) {
      setRewardPoints(0)
      return
    }
    setRewardPoints(value)
  }

  const handleApplyPoints = () => {
    if (rewardPoints > userPoints) {
      toast({
        title: "Insufficient Points",
        description: `You only have ${userPoints} points available.`,
        variant: "destructive",
      })
      return
    }
    if (rewardPoints > 0) {
      toast({ 
        title: "Points Applied!", 
        description: `${rewardPoints} points applied for AED ${rewardPoints} discount.` 
      })
    } else {
      toast({
        title: "No Points Applied",
        description: "Please enter the number of points you want to use.",
        variant: "destructive",
      })
    }
  }

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to place an order.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      const orderData = {
        service: "Virtual RM Service",
        price: AED_PRICE,
        pointsUsed: rewardPoints,
        couponCode: coupon,
        totalAmount: total
      }

      const response = await fetch('http://localhost:4000/api/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to place order: ${errorData.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      // Update local points state
      setUserPoints(data.data.remainingPoints)
      setRewardPoints(0) // Reset points input
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your RM Service has been activated.",
      })
      
      // Redirect to dashboard or payment page
      setTimeout(() => router.push("/jobseeker/dashboard"), 1000)
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePayment = () => {
    toast({ title: "Proceeding to payment...", description: "Redirecting to payment gateway." })
    setTimeout(() => router.push("/jobseeker/payment"), 800)
  }

  const refreshPoints = async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch('http://localhost:4000/api/v1/profile/details', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const calculatedPoints = calculateProfilePoints(data.data)
          setUserPoints(calculatedPoints)
          toast({
            title: "Points Refreshed",
            description: `Your current balance is ${calculatedPoints} points.`,
          })
        }
      }
    } catch (error) {
      // Silent error handling for refresh
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/40 flex flex-col">
      <Navbar />
      <main className="flex flex-col items-center justify-center px-4 py-12 md:py-20 w-full flex-1">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow">
              <ShoppingCart className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Cart</h1>
              <p className="text-gray-600 dark:text-gray-400">Review your selected service before proceeding to payment.</p>
            </div>
          </div>

          {/* Cart Items */}
          <Card className="rounded-xl shadow-md min-h-[110px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">Virtual RM Service
                {!removed && (
                  <Button variant="ghost" size="icon" onClick={handleRemove} style={{cursor:'pointer'}} aria-label="Remove from cart">
                    <Trash2 className="w-5 h-5 text-red-500" style={{cursor:'pointer'}} />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-0">
              <div className="text-gray-700 text-sm flex-1">Dedicated Relationship Manager for your job search journey.</div>
              <div className="font-bold text-lg text-emerald-600">AED 2,500</div>
            </CardContent>
          </Card>

          {/* Reward Points/Coupon */}
          <Card className="rounded-xl shadow-md min-h-[110px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BadgePercent className="w-5 h-5 text-emerald-600" />
                Redeem Findr Points / Coupon
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center gap-4 pt-0">
              <div className="flex flex-col gap-2">
                <Input
                  type="number"
                  min={0}
                  max={userPoints}
                  value={rewardPoints}
                  onChange={e => handlePointsChange(Number(e.target.value))}
                  placeholder="Reward Points"
                  className="max-w-[120px]"
                  disabled={removed || isLoading}
                  style={{cursor:'pointer'}}
                />
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  Available: {isLoading ? 'Loading...' : `${userPoints} points`}
                  <button 
                    onClick={refreshPoints}
                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                    disabled={isLoading}
                  >
                    Refresh
                  </button>
                </div>
              </div>
              <Input
                type="text"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                placeholder="Coupon Code"
                className="max-w-[180px]"
                disabled={removed}
                style={{cursor:'pointer'}}
              />
              <Button 
                className="gradient-bg text-white rounded-full" 
                disabled={removed || isLoading} 
                onClick={handleApplyPoints} 
                style={{cursor:'pointer'}}
              >
                Apply
              </Button>
            </CardContent>
            <CardDescription className="text-xs text-gray-500 pt-2 px-6 pb-4">
              Use earned points to get discounts on premium services. 1 point = 1 AED discount.
            </CardDescription>
          </Card>

          {/* Pricing Summary */}
          <Card className="rounded-xl shadow-md min-h-[180px]">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm pt-0">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>AED {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Savings</span>
                <span className="text-emerald-600">–AED {pointsDiscount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>Inclusive</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>AED {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  className="gradient-bg text-white font-medium rounded-[8px] shadow-md hover:shadow-lg transition"
                  style={{ height: 40, paddingLeft: 24, paddingRight: 24, fontSize: 14, borderRadius: 8, width: 'fit-content' }}
                  onClick={handlePlaceOrder}
                  disabled={removed || isLoading}
                >
                  {isLoading ? 'Loading...' : 'Place Order'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <a href="/jobseeker/premium" className="text-emerald-600 hover:underline text-sm">Back to Premium Services</a>
          </div>
        </div>
      </main>
    </div>
  )
}
