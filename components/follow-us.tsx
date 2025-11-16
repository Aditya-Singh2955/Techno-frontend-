"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Linkedin, Instagram, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FollowUsProps {
  onPointsEarned?: (platform: string, points: number) => void
}

export function FollowUs({ onPointsEarned }: FollowUsProps) {
  const [followedPlatforms, setFollowedPlatforms] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const handleSocialClick = (platform: string, url: string) => {
    // Open social media link in new tab
    window.open(url, '_blank', 'noopener,noreferrer')
    
    // Check if user hasn't already earned points for this platform
    if (!followedPlatforms.has(platform)) {
      // Add platform to followed set
      setFollowedPlatforms(prev => new Set(prev).add(platform))
      
      // Award points (10 per platform)
      const points = 10
      if (onPointsEarned) {
        onPointsEarned(platform, points)
      }
      
      // Show success toast
      toast({
        title: "Points Earned! 🎉",
        description: `You earned ${points} bonus points for following us on ${platform}!`,
      })
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
                className={`flex-1 flex items-center justify-center gap-2 p-4 h-auto transition-all duration-200 ${platform.bgColor} ${
                  hasFollowed 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'border-gray-200'
                }`}
                onClick={() => handleSocialClick(platform.name, platform.url)}
              >
                <Icon className={`w-5 h-5 ${hasFollowed ? 'text-green-600' : platform.color}`} />
                <span className="font-medium">
                  {hasFollowed ? `✓ Followed on ${platform.name}` : `Follow on ${platform.name}`}
                </span>
                {!hasFollowed && (
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