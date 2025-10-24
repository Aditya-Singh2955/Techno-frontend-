"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Mail, Phone, MapPin, Calendar, FileText, Star, 
  Check, X, Clock, Video, Briefcase, DollarSign, ArrowLeft 
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
    professionalSummary?: string;
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
  interviewDate?: string;
}

interface JobDetails {
  _id: string;
  title: string;
  companyName: string;
  location: string;
}

const statusOptions = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Interview Scheduled", value: "interview_scheduled" },
  { label: "Hired", value: "hired" },
  { label: "Rejected", value: "rejected" },
];

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-gray-100 text-gray-800";
    case "shortlisted":
      return "bg-blue-100 text-blue-800";
    case "interview_scheduled":
      return "bg-green-100 text-green-800";
    case "hired":
      return "bg-purple-100 text-purple-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    date: "",
    time: "",
    mode: "in-person",
    notes: ""
  });

  // Fetch applicants for the job
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

      // Fetch job details
      const jobResponse = await axios.get(`http://localhost:4000/api/v1/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setJobDetails(jobResponse.data.data);

      // Fetch applicants
      const response = await axios.get(`http://localhost:4000/api/v1/applications/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setApplicants(response.data.data || []);
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

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const matchesSearch =
        app.applicantDetails?.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.applicantDetails?.email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter ? app.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [applicants, search, statusFilter]);

  const updateApplicantStatus = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      await axios.patch(`http://localhost:4000/api/v1/applications/${applicationId}/status`, {
        status: newStatus,
        notes
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      toast({
        title: "Success",
        description: `Applicant status updated to ${formatStatus(newStatus)}.`,
      });
      
      fetchApplicants(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update applicant status.",
        variant: "destructive",
      });
    }
  };

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

  const rateApplicant = async (applicationId: string, rating: number) => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      await axios.patch(`http://localhost:4000/api/v1/applications/${applicationId}/rate`, {
        rating
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      toast({
        title: "Success",
        description: "Applicant rated successfully.",
      });
      
      fetchApplicants();
    } catch (error) {
      console.error('Error rating applicant:', error);
      toast({
        title: "Error",
        description: "Failed to rate applicant.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/employer/active-jobs')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-1 tracking-tight">
                Applicants for {jobDetails?.title || "Loading..."}
              </h1>
              <p className="text-gray-600 text-base">
                {jobDetails?.companyName} • {jobDetails?.location}
              </p>
              <div className="mt-2">
                <Badge variant="secondary">{applicants.length} Total Applicants</Badge>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 flex-1"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <p>No applicants found.</p>
                </div>
              )}
              {filteredApplicants.map((applicant) => (
                <Card key={applicant._id} className="transition-shadow duration-200 shadow-md border-0 bg-white rounded-xl hover:shadow-lg">
                  <CardContent className="p-6">
                    {/* Applicant Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          {applicant.applicantDetails?.profilePicture ? (
                            <img 
                              src={applicant.applicantDetails.profilePicture} 
                              alt={applicant.applicantDetails.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {applicant.applicantDetails?.name || 'Unknown'}
                          </h3>
                          <Badge className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(applicant.status)}`}>
                            {formatStatus(applicant.status)}
                          </Badge>
                        </div>
                      </div>
                      {!applicant.viewedByEmployer && (
                        <Badge variant="secondary" className="text-xs">New</Badge>
                      )}
                    </div>

                    {/* Applicant Details */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {applicant.applicantDetails?.email}
                      </div>
                      {applicant.applicantDetails?.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {applicant.applicantDetails.phone}
                        </div>
                      )}
                      {applicant.applicantDetails?.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {applicant.applicantDetails.location}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
                      </div>
                      {applicant.expectedSalary && (
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Expected: AED {applicant.expectedSalary.min} - {applicant.expectedSalary.max}
                        </div>
                      )}
                      {applicant.availability && (
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {applicant.availability}
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <span className="text-sm text-gray-600 mr-2">Rating:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => rateApplicant(applicant._id, star)}
                            className="p-1"
                          >
                            <Star 
                              className={`w-4 h-4 ${
                                applicant.rating && applicant.rating >= star 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comments Section */}
                    {applicant.employerComments && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">Employer Comments:</div>
                        <div className="text-sm text-gray-600">{applicant.employerComments}</div>
                        {applicant.reviewTimestamp && (
                          <div className="text-xs text-gray-500 mt-1">
                            Reviewed: {new Date(applicant.reviewTimestamp).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {applicant.resume && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="col-span-2"
                          onClick={() => window.open(applicant.resume, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Resume
                        </Button>
                      )}
                      
                      {/* Comprehensive Review Button */}
                      <Button
                        size="sm"
                        className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => openReviewDialog(applicant)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Complete Review
                      </Button>
                      {applicant.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => updateApplicantStatus(applicant._id, 'shortlisted')}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Shortlist
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateApplicantStatus(applicant._id, 'rejected')}
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
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              setSelectedApplicant(applicant);
                              setInterviewDialogOpen(true);
                            }}
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateApplicantStatus(applicant._id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {applicant.status === 'interview_scheduled' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => updateApplicantStatus(applicant._id, 'hired')}
                          >
                            <Briefcase className="w-4 h-4 mr-1" />
                            Hire
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateApplicantStatus(applicant._id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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

