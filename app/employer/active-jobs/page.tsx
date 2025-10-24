"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Edit2, X, Pause, Play, Eye, Users, Calendar, MapPin, DollarSign, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  status: string;
  createdAt: string;
  applications?: any[];
  applicationCount?: number;
  views?: number;
  salary?: {
    min: number;
    max: number;
  };
  jobType?: string[];
  experienceLevel?: string;
  description?: string;
}

const statusOptions = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Closed", value: "closed" },
];

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "paused":
      return "bg-yellow-100 text-yellow-800";
    case "closed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ActiveJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [closeJobId, setCloseJobId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view your jobs.",
          variant: "destructive",
        });
        router.push('/login/employer');
        return;
      }

      const response = await axios.get('http://localhost:4000/api/v1/employer/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          ...(status && { status }),
          ...(search && { search }),
        }
      });

      setJobs(response.data.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [status]);

  // Handle search when user stops typing
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (search !== "") {
        fetchJobs();
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [search]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                           job.companyName?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [jobs, search]);

  // Job status counts
  const jobCounts = useMemo(() => {
    return {
      total: jobs.length,
      active: jobs.filter(job => job.status === 'active').length,
      paused: jobs.filter(job => job.status === 'paused').length,
      closed: jobs.filter(job => job.status === 'closed').length,
    };
  }, [jobs]);

  // Toggle job status (pause/resume)
  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      await axios.put(`http://localhost:4000/api/v1/jobs/${jobId}`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      toast({
        title: "Success",
        description: `Job ${newStatus === 'active' ? 'resumed' : 'paused'} successfully.`,
      });
      
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Close job
  const handleCloseJob = async () => {
    if (!closeJobId) return;

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      await axios.put(`http://localhost:4000/api/v1/jobs/${closeJobId}/close`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      toast({
        title: "Success",
        description: "Job closed successfully.",
      });
      
      setCloseJobId(null);
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error closing job:', error);
      toast({
        title: "Error",
        description: "Failed to close job. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Navigate to edit page
  const handleEditJob = (jobId: string) => {
    router.push(`/employer/active-jobs/${jobId}/edit`);
  };

  // View applicants
  const handleViewApplicants = (jobId: string) => {
    router.push(`/employer/applicants/${jobId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 pt-4 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100">
            <div>
              <h1 className="text-3xl font-bold mb-1 tracking-tight">My Jobs</h1>
              <p className="text-gray-600 text-base">Manage all your job postings</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by job title or company…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-64"
              />
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchJobs}
                disabled={isLoading}
                className="rounded-xl"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Job Status Summary */}
          {!isLoading && jobs.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{jobCounts.total}</div>
                <div className="text-sm text-gray-600">Total Jobs</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-green-600">{jobCounts.active}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-yellow-600">{jobCounts.paused}</div>
                <div className="text-sm text-gray-600">Paused</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-red-600">{jobCounts.closed}</div>
                <div className="text-sm text-gray-600">Closed</div>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="text-gray-600 mt-2">Loading jobs...</p>
            </div>
          )}

          {/* Jobs Grid */}
          {!isLoading && (
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {filteredJobs.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  <p>No jobs found{status ? ` with status "${statusOptions.find(opt => opt.value === status)?.label}"` : ''}.</p>
                  <Button 
                    className="mt-4 gradient-bg text-white"
                    onClick={() => router.push('/employer/post-job')}
                  >
                    {jobs.length === 0 ? 'Post Your First Job' : 'Post Another Job'}
                  </Button>
                </div>
              )}
              {filteredJobs.map((job) => (
                <Card key={job._id} className="transition-shadow duration-200 shadow-md border border-gray-200 bg-white rounded-xl hover:shadow-lg">
                  <CardContent className="p-6">
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.companyName}</p>
                      </div>
                      <Badge className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(job.status)}`}>
                        {job.status}
                      </Badge>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Posted: {formatDate(job.createdAt)}
                      </div>
                      {job.salary && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          AED {job.salary.min} - {job.salary.max}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="font-medium">{job.applications?.length || job.applicationCount || 0}</span> Applicants
                        </div>
                        <div className="flex items-center text-blue-600">
                          <Eye className="w-4 h-4 mr-2" />
                          <span className="font-medium">{job.views || 0}</span> Views
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewApplicants(job._id)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Applicants
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditJob(job._id)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(job._id, job.status)}
                      >
                        {job.status === 'active' ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setCloseJobId(job._id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Close Confirmation Dialog */}
          <AlertDialog open={!!closeJobId} onOpenChange={() => setCloseJobId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Close this job?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will close the job posting and hide it from job seekers. The job and all associated applications will be preserved, but job seekers will no longer be able to see or apply to this position.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCloseJob} className="bg-red-600 hover:bg-red-700">
                  Close Job
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
} 