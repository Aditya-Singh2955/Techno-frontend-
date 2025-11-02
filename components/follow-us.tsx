"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Linkedin, Instagram, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FollowUsProps {
  onPointsEarned?: (platform: string, points: number, totalPoints: number) => void
}

export function FollowUs({ onPointsEarned }: FollowUsProps) {
  const [followedPlatforms, setFollowedPlatforms] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const { toast } = useToast()

  // Fetch current follow status on mount
  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
        if (!token) return

        const response = await fetch('https://techno-backend-a0s0.onrender.com/api/v1/profile/details', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const followed = new Set<string>()
            if (data.data.linkedIn === true) followed.add('LinkedIn')
            if (data.data.instagram === true) followed.add('Instagram')
            setFollowedPlatforms(followed)
          }
        }
      } catch (error) {
        console.error('Error fetching follow status:', error)
      }
    }

    fetchFollowStatus()
  }, [])

  const handleSocialClick = async (platform: string, url: string) => {
    // Open social media link in new tab
    window.open(url, '_blank', 'noopener,noreferrer')
    
    // Check if user already followed (from database state)
    if (followedPlatforms.has(platform)) {
      toast({
        title: "Already Followed",
        description: `You have already followed us on ${platform}.`,
      })
      return
    }

    // Prevent multiple clicks
    if (isLoading[platform]) return

    setIsLoading(prev => ({ ...prev, [platform]: true }))

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to earn points.",
          variant: "destructive",
        })
        setIsLoading(prev => ({ ...prev, [platform]: false }))
        return
      }

      // Map platform name to API format
      const platformKey = platform === 'LinkedIn' ? 'linkedIn' : 'instagram'

      const response = await fetch('https://techno-backend-a0s0.onrender.com/api/v1/profile/follow-social', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform: platformKey }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Update local state
        setFollowedPlatforms(prev => new Set(prev).add(platform))
        
        // Call callback with points and total
        if (onPointsEarned && data.data.pointsAwarded > 0) {
          onPointsEarned(platform, data.data.pointsAwarded, data.data.totalPoints)
        }
        
        toast({
          title: data.data.pointsAwarded > 0 ? "Points Earned! 🎉" : "Already Followed",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to process follow action",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error following social media:', error)
      toast({
        title: "Error",
        description: "Failed to process follow action. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(prev => ({ ...prev, [platform]: false }))
    }
  }

  const platforms = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://www.linkedin.com/company/findr-jobs",
      color: "text-blue-600 hover:text-blue-700",
      bgColor: "hover:bg-blue-50"
    },
    {
      name: "Instagram", 
      icon: Instagram,
      url: "https://www.instagram.com/findr.jobs",
      color: "text-pink-600 hover:text-pink-700",
      bgColor: "hover:bg-pink-50"
    }
  ]

  return (
    <Card className="card-shadow border-0">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Star className="w-4 h-4 mr-2 text-yellow-500" />
          Follow Us
        </CardTitle>
        <CardDescription>
          🎉 Follow us on LinkedIn or Instagram and earn 10 bonus points!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          {platforms.map((platform) => {
            const Icon = platform.icon
            const hasFollowed = followedPlatforms.has(platform.name)
            
            return (
              <Button
                key={platform.name}
                variant="outline"
                disabled={hasFollowed || isLoading[platform.name]}
                className={`flex-1 flex items-center justify-center gap-2 p-4 h-auto transition-all duration-200 ${platform.bgColor} ${
                  hasFollowed 
                    ? 'bg-green-50 border-green-200 text-green-700 cursor-not-allowed' 
                    : 'border-gray-200'
                } ${isLoading[platform.name] ? 'opacity-50 cursor-wait' : ''}`}
                onClick={() => handleSocialClick(platform.name, platform.url)}
              >
                <Icon className={`w-5 h-5 ${hasFollowed ? 'text-green-600' : platform.color}`} />
                <span className="font-medium">
                  {isLoading[platform.name] 
                    ? `Processing...` 
                    : hasFollowed 
                    ? `✓ Followed on ${platform.name}` 
                    : `Follow on ${platform.name}`
                  }
                </span>
                {!hasFollowed && !isLoading[platform.name] && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-1">
                    +10 pts
                  </span>
                )}
              </Button>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Points are awarded once per platform. Links open in a new tab.
        </p>
      </CardContent>
    </Card>
  )
}