"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Eye,
  Users,
  Filter,
  Search,
  Check,
  X,
  Clock,
  Video,
  Star,
  TrendingUp
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Applicant {
  _id: string;
  applicantDetails: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    profilePicture?: string;
    membershipTier?: string;
  };
  jobDetails: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
  };
  status: string;
  appliedDate: string;
  expectedSalary?: {
    min: number;
    max: number;
  };
  availability?: string;
  coverLetter?: string;
  resume?: string;
  rating?: number;
  viewedByEmployer: boolean;
  employerNotes?: string;
}

interface Job {
  _id: string;
  title: string;
}

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Interview Scheduled", value: "interview_scheduled" },
  { label: "Hired", value: "hired" },
  { label: "Rejected", value: "rejected" },
];

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md";
    case "shortlisted":
      return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md";
    case "interview_scheduled":
      return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md";
    case "hired":
      return "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md";
    case "rejected":
      return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md";
    default:
      return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md";
  }
};

const getCardGradient = (index: number, status?: string) => {
  const gradients = [
    "from-blue-50 via-emerald-50 to-blue-100",
    "from-emerald-50 via-blue-50 to-emerald-100",
    "from-purple-50 via-pink-50 to-purple-100",
    "from-cyan-50 via-blue-50 to-cyan-100",
    "from-indigo-50 via-purple-50 to-indigo-100",
    "from-teal-50 via-emerald-50 to-teal-100",
  ];
  
  if (status === 'hired') {
    return "from-purple-50 via-pink-50 to-purple-100";
  } else if (status === 'interview_scheduled') {
    return "from-emerald-50 via-green-50 to-emerald-100";
  } else if (status === 'shortlisted') {
    return "from-blue-50 via-cyan-50 to-blue-100";
  }
  
  return gradients[index % gradients.length];
};

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default function AllApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    date: "",
    time: "",
    mode: "in-person",
    notes: ""
  });
  const { toast } = useToast();
  const router = useRouter();

  // Fetch all applicants for employer
  const fetchApplicants = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view applicants.",
          variant: "destructive",
        });
        router.push('/login/employer');
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (jobFilter && jobFilter !== 'all') params.append('jobId', jobFilter);

      const response = await axios.get(`http://localhost:4000/api/v1/applications/employer?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setApplicants(response.data.data || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applicants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch employer jobs for filter dropdown
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get('http://localhost:4000/api/v1/employer/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setJobs(response.data.data?.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [pagination.page, statusFilter, jobFilter]);

  // Filter applicants based on search
  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const matchesSearch = !search || 
        app.applicantDetails?.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.applicantDetails?.email?.toLowerCase().includes(search.toLowerCase()) ||
        app.jobDetails?.title?.toLowerCase().includes(search.toLowerCase());
      
      return matchesSearch;
    });
  }, [applicants, search]);

  // Update application status
  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      await axios.patch(`http://localhost:4000/api/v1/applications/${applicationId}/status`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      toast({
        title: "Success",
        description: `Application status updated to ${formatStatus(newStatus)}.`,
      });
      
      fetchApplicants(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update application status.",
        variant: "destructive",
      });
    }
  };

  // Schedule interview
  const scheduleInterview = async () => {
    if (!selectedApplicant) return;

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      const interviewDateTime = `${interviewDetails.date}T${interviewDetails.time}`;
      
      await axios.patch(`http://localhost:4000/api/v1/applications/${selectedApplicant._id}/status`, {
        status: "interview_scheduled",
        notes: interviewDetails.notes,
        interviewDate: interviewDateTime,
        interviewMode: interviewDetails.mode
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      toast({
        title: "Interview Scheduled",
        description: `Interview scheduled for ${selectedApplicant.applicantDetails.name}.`,
      });
      
      setInterviewDialogOpen(false);
      setInterviewDetails({ date: "", time: "", mode: "in-person", notes: "" });
      fetchApplicants();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast({
        title: "Error",
        description: "Failed to schedule interview.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-blue-50 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 bg-gradient-to-r from-white via-emerald-50/50 to-blue-50 backdrop-blur-sm p-6 rounded-xl border-b border-emerald-200/50 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-1 tracking-tight gradient-text flex items-center gap-2">
                  <Users className="w-8 h-8 text-emerald-600" />
                  All Applicants
                </h1>
                <p className="text-gray-600 text-base">
                  Manage all applicants across your job postings
                  {pagination.total > 0 && (
                    <span className="ml-2 text-emerald-600 font-medium">
                      ({pagination.total} total)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-white to-emerald-50/30">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    Search Applicants
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, email, or job title..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full rounded-xl border-2 border-emerald-200 bg-white px-4 py-2 pl-10 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                    />
                    <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="w-4 h-4 inline mr-1" />
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-2 border-blue-200 shadow-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Job Position
                  </label>
                  <Select value={jobFilter} onValueChange={setJobFilter}>
                    <SelectTrigger className="border-2 border-purple-200 shadow-md focus:ring-2 focus:ring-purple-400 focus:border-purple-400">
                      <SelectValue placeholder="All Jobs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jobs</SelectItem>
                      {jobs.map(job => (
                        <SelectItem key={job._id} value={job._id}>{job.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="text-gray-600 mt-2">Loading applicants...</p>
            </div>
          )}

          {/* Applicants Grid */}
          {!isLoading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredApplicants.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No applicants found</p>
                  <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
              )}
              {filteredApplicants.map((applicant, idx) => {
                const cardGradient = getCardGradient(idx, applicant.status);
                const applicantName = applicant.applicantDetails?.name || 'Unknown';
                
                return (
                  <Card key={applicant._id} className={`transition-shadow duration-200 shadow-lg border-2 border-transparent bg-gradient-to-br ${cardGradient} rounded-2xl overflow-hidden relative`}>
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-bl-full"></div>
                    
                    <CardContent className="p-6 relative z-10">
                      {/* Applicant Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          {applicant.applicantDetails?.profilePicture ? (
                            <div className="w-12 h-12 rounded-full ring-2 ring-white shadow-md overflow-hidden">
                              <img 
                                src={applicant.applicantDetails.profilePicture} 
                                alt={applicantName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white">
                              {applicantName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">
                              {applicantName}
                            </h3>
                            <Badge className={`text-xs px-3 py-1 rounded-full font-semibold mt-1 ${statusColor(applicant.status)}`}>
                              {formatStatus(applicant.status)}
                            </Badge>
                          </div>
                        </div>
                        {!applicant.viewedByEmployer && (
                          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md text-xs px-2 py-1">New</Badge>
                        )}
                      </div>

                      {/* Job & Contact Details */}
                      <div className="space-y-2 mb-4 pt-2 border-t border-white/50">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Briefcase className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium">{applicant.jobDetails?.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="truncate">{applicant.applicantDetails?.email}</span>
                        </div>
                        {applicant.applicantDetails?.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span>{applicant.applicantDetails.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span>Applied: {new Date(applicant.appliedDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          className="col-span-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md"
                          onClick={() => router.push(`/employer/applicants/profile/${applicant._id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                        {applicant.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                              onClick={() => updateApplicationStatus(applicant._id, 'shortlisted')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Shortlist
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                              onClick={() => updateApplicationStatus(applicant._id, 'rejected')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {applicant.status === 'shortlisted' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md"
                              onClick={() => {
                                setSelectedApplicant(applicant);
                                setInterviewDialogOpen(true);
                              }}
                            >
                              <Video className="w-4 h-4 mr-1" />
                              Interview
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                              onClick={() => updateApplicationStatus(applicant._id, 'rejected')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {applicant.status === 'interview_scheduled' && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white col-span-2 shadow-md"
                            onClick={() => updateApplicationStatus(applicant._id, 'hired')}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Hire Candidate
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Schedule Interview Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview with {selectedApplicant?.applicantDetails?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={interviewDetails.date}
                onChange={(e) => setInterviewDetails(prev => ({...prev, date: e.target.value}))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={interviewDetails.time}
                onChange={(e) => setInterviewDetails(prev => ({...prev, time: e.target.value}))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mode" className="text-right">
                Interview Mode
              </Label>
              <Select value={interviewDetails.mode} onValueChange={(value) => setInterviewDetails(prev => ({...prev, mode: value}))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select interview mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      In-Person
                    </div>
                  </SelectItem>
                  <SelectItem value="virtual">
                    <div className="flex items-center">
                      <Video className="w-4 h-4 mr-2" />
                      Virtual
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={interviewDetails.notes}
                onChange={(e) => setInterviewDetails(prev => ({...prev, notes: e.target.value}))}
                placeholder="Interview details, location, or meeting link..."
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={scheduleInterview} className="gradient-bg text-white">
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}