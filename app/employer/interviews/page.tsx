"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Interview {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
  };
  applicantId: {
    _id: string;
    name?: string;
    fullName?: string;
    email: string;
    phoneNumber?: string;
    profilePicture?: string;
  };
  interviewDate: string;
  employerNotes?: string;
  status: string;
}

const typeOptions = [
  { label: "All Types", value: "" },
  { label: "Online", value: "Online" },
  { label: "In-Person", value: "In-Person" },
];
const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Upcoming", value: "Upcoming" },
  { label: "Completed", value: "Completed" },
  { label: "Rescheduled", value: "Rescheduled" },
];
const statusColor = (status: string) => {
  switch (status) {
    case "Upcoming":
      return "bg-blue-100 text-blue-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Rescheduled":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function InterviewsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch interviews from API
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        router.push('/login/employer');
        return;
      }

      const response = await axios.get('http://localhost:4000/api/v1/interviews/employer', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setInterviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch interviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const filteredInterviews = useMemo(() => {
    return interviews.filter(intv => {
      const candidateName = intv.applicantId?.fullName || intv.applicantId?.name || intv.applicantId?.email || '';
      const matchesSearch = candidateName.toLowerCase().includes(search.toLowerCase()) ||
                           intv.jobId?.title?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [search, interviews]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 pt-4 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100">
            <div>
              <h1 className="text-3xl font-bold mb-1 tracking-tight">Interviews</h1>
              <p className="text-gray-600 text-base">List of all scheduled interviews</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by candidate name or position"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-64"
              />
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Interviews Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredInterviews.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-12">No interviews found.</div>
            )}
            {filteredInterviews.map((intv, idx) => (
              <Link key={idx} href={`/employer/applicants/profile/${intv.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="block">
                <Card className="transition-shadow duration-200 shadow-md border border-gray-200 bg-white rounded-xl hover:shadow-lg flex flex-col justify-between min-h-[150px]">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg text-gray-900">{intv.name}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(intv.status)}`}>{intv.status}</span>
                    </div>
                    <div className="text-sm text-gray-600">Position: <span className="font-medium text-gray-800">{intv.job}</span></div>
                    <div className="text-xs text-gray-500">Date & Time: {intv.datetime}</div>
                    <div className="text-xs text-gray-500">Interviewer: {intv.interviewer}</div>
                    <div className="text-xs text-gray-500">Type: {intv.type}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 