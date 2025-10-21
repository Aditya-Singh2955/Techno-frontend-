"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface HiredCandidate {
  _id: string;
  applicantDetails: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    location?: string;
    profilePicture?: string;
  };
  jobDetails: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
  };
  appliedDate: string;
  updatedAt: string;
  status: string;
}

const roleOptions = [
  { label: "All Roles", value: "" },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function HiresPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [hires, setHires] = useState<HiredCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch hired candidates from API
  const fetchHiredCandidates = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view hired candidates.",
          variant: "destructive",
        });
        router.push('/login/employer');
        return;
      }

      const response = await axios.get('https://techno-backend-a0s0.onrender.com/api/v1/applications/employer', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          status: 'hired',
          limit: 100 // Get more hired candidates
        }
      });

      setHires(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hired candidates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hired candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHiredCandidates();
  }, []);

  const filteredHires = useMemo(() => {
    return hires.filter(hire => {
      const matchesSearch =
        hire.applicantDetails.name.toLowerCase().includes(search.toLowerCase()) ||
        hire.jobDetails.title.toLowerCase().includes(search.toLowerCase());
      const matchesRole = role ? hire.jobDetails.title === role : true;
      return matchesSearch && matchesRole;
    });
  }, [search, role, hires]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 pt-4 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100">
            <div>
              <h1 className="text-3xl font-bold mb-1 tracking-tight">Hires</h1>
              <p className="text-gray-600 text-base">List of all candidates marked as hired</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by name, role or joining date…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-64"
              />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {roleOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading hired candidates...</p>
            </div>
          )}

          {/* Hires Grid */}
          {!isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHires.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  {hires.length === 0 ? "No hired candidates yet." : "No hired candidates match your search."}
                </div>
              )}
              {filteredHires.map((hire) => (
                <Link key={hire._id} href={`/employer/applicants/profile/${hire._id}`}
                  className="block">
                  <Card className="transition-shadow duration-200 shadow-md border border-gray-200 bg-white rounded-xl hover:shadow-lg flex flex-col justify-between min-h-[150px]">
                    <CardContent className="p-6 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg text-gray-900">{hire.applicantDetails.name}</span>
                        <Badge className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">Hired</Badge>
                      </div>
                      <div className="text-sm text-gray-600">Position: <span className="font-medium text-gray-800">{hire.jobDetails.title}</span></div>
                      <div className="text-sm text-gray-600">Company: <span className="font-medium text-gray-800">{hire.jobDetails.companyName}</span></div>
                      <div className="text-xs text-gray-500">Applied on: {formatDate(hire.appliedDate)}</div>
                      <div className="text-xs text-gray-500">Hired on: {formatDate(hire.updatedAt)}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 