// "use client"
// import { Navbar } from "@/components/navbar"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { PlusCircle, Users, Calendar, TrendingUp, Eye, MessageSquare, Building, UserPlus } from "lucide-react"
// import Link from "next/link"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation"
// import { applications as applicationsData } from "@/lib/applications"

// export default function EmployerDashboard() {
//   const router = useRouter();
//   // Add state for modals
//   const [reviewOpen, setReviewOpen] = useState(false);
//   const [selectedApp, setSelectedApp] = useState<any>(null);
//   const [review, setReview] = useState<{ rating: number; comments: string; status: string; timestamp: string | null }>({ rating: 0, comments: '', status: '', timestamp: null });
//   const [userProfile, setUserProfile] = useState<any>(null);
//   const [dashboardStats, setDashboardStats] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Clear any pending redirect since we've reached the dashboard
//     localStorage.removeItem('pendingRedirect');
    
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
//         console.log('Employer Dashboard: Token found:', !!token);
        
//         if (!token) {
//           console.log('Employer Dashboard: No token, redirecting to login');
//           router.push('/login');
//           return;
//         }

//         // Fetch employer profile
//         const profileResponse = await fetch('http://localhost:4000/api/v1/employer/details', {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!profileResponse.ok) {
//           console.log('Employer Dashboard: Profile API failed with status:', profileResponse.status);
//           throw new Error('Failed to fetch profile');
//         }

//         const profileData = await profileResponse.json();
//         console.log('Employer Dashboard: Profile data received:', profileData);
//         setUserProfile(profileData.data);

//         // Fetch dashboard statistics
//         const statsResponse = await fetch('http://localhost:4000/api/v1/employer/dashboard/stats', {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (statsResponse.ok) {
//           const statsData = await statsResponse.json();
//           console.log('Employer Dashboard: Stats data received:', statsData);
//           setDashboardStats(statsData.data);
//         } else {
//           console.log('Employer Dashboard: Stats API failed, using default values');
//           // Set default values if stats API fails
//           setDashboardStats({
//             jobStats: { total: 0, active: 0, draft: 0, paused: 0, closed: 0 },
//             applicationStats: { total: 0, pending: 0, shortlisted: 0, interviewScheduled: 0, hired: 0, rejected: 0 },
//             recentApplications: [],
//             topPerformingJobs: []
//           });
//         }
//       } catch (error) {
//         console.error('Employer Dashboard: Error fetching data:', error);
//         // If token is invalid, redirect to login
//         console.log('Employer Dashboard: Redirecting to login due to error');
//         router.push('/login');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [router]);

//   // Add state for metric card modals
//   const [activeJobsOpen, setActiveJobsOpen] = useState(false);
//   const [applicantsOpen, setApplicantsOpen] = useState(false);
//   const [interviewsOpen, setInterviewsOpen] = useState(false);
//   const [hiresOpen, setHiresOpen] = useState(false);

//   // Use shared applications data
//   const applications = applicationsData;

//   // Mock data for modals
//   const activeJobs = [
//     { title: "Senior Software Engineer", posted: "2024-07-10", applicants: 12, status: "Active" },
//     { title: "Marketing Manager", posted: "2024-07-07", applicants: 23, status: "Paused" },
//     { title: "HR Coordinator", posted: "2024-07-03", applicants: 31, status: "Active" },
//   ];
//   const applicants = [
//     { name: "Sarah Johnson", job: "Senior Software Engineer", date: "2024-07-12", status: "Shortlisted" },
//     { name: "Michael Chen", job: "Marketing Manager", date: "2024-07-12", status: "Interview Scheduled" },
//     { name: "Emma Wilson", job: "HR Coordinator", date: "2024-07-11", status: "Shortlisted" },
//   ];
//   const interviews = [
//     { name: "Michael Chen", job: "Marketing Manager", datetime: "2024-07-15 10:00", interviewer: "Jane Smith" },
//     { name: "Sarah Johnson", job: "Senior Software Engineer", datetime: "2024-07-16 14:00", interviewer: "Ahmed Ali" },
//   ];
//   const hires = [
//     { name: "Emma Wilson", job: "HR Coordinator", date: "2024-07-10", onboarding: "Completed" },
//     { name: "Sarah Johnson", job: "Senior Software Engineer", date: "2024-07-09", onboarding: "In Progress" },
//   ];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <Navbar />
//         <main className="p-4 lg:p-6">
//           <div className="max-w-7xl mx-auto space-y-6">
//             <div className="bg-white rounded-2xl p-6 card-shadow border-0">
//               <div className="animate-pulse">
//                 <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
//                 <div className="h-4 bg-gray-200 rounded w-2/3"></div>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
//               {[1, 2, 3, 4, 5].map((i) => (
//                 <div key={i} className="bg-white rounded-lg p-4 card-shadow border-0">
//                   <div className="animate-pulse">
//                     <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3"></div>
//                     <div className="h-6 bg-gray-200 rounded w-8 mb-1"></div>
//                     <div className="h-3 bg-gray-200 rounded w-16"></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <Navbar />

//       <main className="p-4 lg:p-6">
//         <div className="max-w-7xl mx-auto space-y-6">
//           {/* Welcome Header */}
//           <div className="bg-white rounded-2xl p-6 card-shadow border-0">
//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//               <div className="mb-4 lg:mb-0">
//                 <h1 className="text-2xl font-bold mb-2">
//                   Welcome back, {userProfile?.name || 'User'}!
//                 </h1>
//                 <p className="text-gray-600">Manage your recruitment activities and find top talent</p>
//               </div>
//               <div className="flex flex-col sm:flex-row gap-6">
//                 <div className="text-center">
//                   <div className="text-xl font-bold text-blue-600">
//                     {dashboardStats?.jobStats?.active || userProfile?.activeJobs?.length || 0}
//                   </div>
//                   <div className="text-sm text-gray-600">Active Jobs</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-xl font-bold text-emerald-600">
//                     {dashboardStats?.applicationStats?.total || userProfile?.applications?.length || 0}
//                   </div>
//                   <div className="text-sm text-gray-600">Total Applicants</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Quick Stats */}
//           <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
//             {/* Active Jobs Card - now links to full page */}
//             <Link href="/employer/active-jobs" className="cursor-pointer">
//               <Card className="card-shadow border-0 card-hover">
//                 <CardContent className="p-4">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
//                       <PlusCircle className="w-5 h-5 text-blue-600" />
//                     </div>
//                     <div>
//                       <p className="text-xl font-bold">
//                         {dashboardStats?.jobStats?.active || userProfile?.activeJobs?.length || 0}
//                       </p>
//                       <p className="text-xs text-gray-600">Active Jobs</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>
//             {/* Applicants Card - now links to full page */}
//             <Link href="/employer/applicants" className="cursor-pointer">
//               <Card className="card-shadow border-0 card-hover">
//                 <CardContent className="p-4">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
//                       <Users className="w-5 h-5 text-green-600" />
//                     </div>
//                     <div>
//                       <p className="text-xl font-bold">
//                         {dashboardStats?.applicationStats?.total || userProfile?.applications?.length || 0}
//                       </p>
//                       <p className="text-xs text-gray-600">Applicants</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>
//             {/* Interviews Card - now links to full page */}
//             <Link href="/employer/interviews" className="cursor-pointer">
//               <Card className="card-shadow border-0 card-hover">
//                 <CardContent className="p-4">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
//                       <Calendar className="w-5 h-5 text-yellow-600" />
//                     </div>
//                     <div>
//                       <p className="text-xl font-bold">
//                         {dashboardStats?.applicationStats?.interviewScheduled || 0}
//                       </p>
//                       <p className="text-xs text-gray-600">Interviews</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>
//             {/* Hires Card - now links to full page */}
//             <Link href="/employer/hires" className="cursor-pointer">
//               <Card className="card-shadow border-0 card-hover">
//                 <CardContent className="p-4">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
//                       <TrendingUp className="w-5 h-5 text-purple-600" />
//                     </div>
//                     <div>
//                       <p className="text-xl font-bold">
//                         {dashboardStats?.applicationStats?.hired || 0}
//                       </p>
//                       <p className="text-xs text-gray-600">Hires</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>
//           </div>

//           {/* Modals for Metric Cards */}
//           {/* Active Jobs Modal */}
//           <Dialog open={activeJobsOpen} onOpenChange={setActiveJobsOpen}>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Active Job Postings</DialogTitle>
//                 <DialogDescription>List of currently active job postings</DialogDescription>
//               </DialogHeader>
//               <div className="space-y-3">
//                 {activeJobs.map((job, idx) => (
//                   <div key={idx} className="p-3 bg-gray-50 rounded-lg border flex flex-col md:flex-row md:items-center md:justify-between">
//                     <div>
//                       <div className="font-semibold">{job.title}</div>
//                       <div className="text-xs text-gray-600">Posted: {job.posted}</div>
//                     </div>
//                     <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
//                       <span className="text-xs text-gray-600">Applicants: {job.applicants}</span>
//                       <Badge className={job.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{job.status}</Badge>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </DialogContent>
//           </Dialog>
//           {/* Applicants Modal */}
//           <Dialog open={applicantsOpen} onOpenChange={setApplicantsOpen}>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Applicants</DialogTitle>
//                 <DialogDescription>List of all applicants across active jobs</DialogDescription>
//               </DialogHeader>
//               <div className="space-y-3">
//                 {applicants.map((app, idx) => (
//                   <div key={idx} className="p-3 bg-gray-50 rounded-lg border flex flex-col md:flex-row md:items-center md:justify-between">
//                     <div>
//                       <div className="font-semibold">{app.name}</div>
//                       <div className="text-xs text-gray-600">Applied for: {app.job}</div>
//                     </div>
//                     <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
//                       <span className="text-xs text-gray-600">Date: {app.date}</span>
//                       <Badge className="bg-blue-100 text-blue-800 text-xs">{app.status}</Badge>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </DialogContent>
//           </Dialog>
//           {/* Interviews Modal */}
//           <Dialog open={interviewsOpen} onOpenChange={setInterviewsOpen}>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Scheduled Interviews</DialogTitle>
//                 <DialogDescription>List of scheduled interviews</DialogDescription>
//               </DialogHeader>
//               <div className="space-y-3">
//                 {interviews.map((intv, idx) => (
//                   <div key={idx} className="p-3 bg-gray-50 rounded-lg border flex flex-col md:flex-row md:items-center md:justify-between">
//                     <div>
//                       <div className="font-semibold">{intv.name}</div>
//                       <div className="text-xs text-gray-600">Job: {intv.job}</div>
//                     </div>
//                     <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
//                       <span className="text-xs text-gray-600">Date & Time: {intv.datetime}</span>
//                       <span className="text-xs text-gray-600">Interviewer: {intv.interviewer}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </DialogContent>
//           </Dialog>
//           {/* Hires Modal */}
//           <Dialog open={hiresOpen} onOpenChange={setHiresOpen}>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Hired Candidates</DialogTitle>
//                 <DialogDescription>List of candidates marked as hired</DialogDescription>
//               </DialogHeader>
//               <div className="space-y-3">
//                 {hires.map((hire, idx) => (
//                   <div key={idx} className="p-3 bg-gray-50 rounded-lg border flex flex-col md:flex-row md:items-center md:justify-between">
//                     <div>
//                       <div className="font-semibold">{hire.name}</div>
//                       <div className="text-xs text-gray-600">Hired for: {hire.job}</div>
//                     </div>
//                     <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
//                       <span className="text-xs text-gray-600">Hiring Date: {hire.date}</span>
//                       <Badge className={hire.onboarding === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{hire.onboarding}</Badge>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </DialogContent>
//           </Dialog>

//           {/* Main Actions */}
//           <div className="grid lg:grid-cols-3 gap-4">
//             <Card className="card-shadow border-0 card-hover bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col h-full">
//               <CardHeader className="pb-3 flex-shrink-0">
//                 <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-3">
//                   <PlusCircle className="w-6 h-6 text-white" />
//                 </div>
//                 <CardTitle className="text-lg">Post a Job</CardTitle>
//                 <CardDescription className="text-sm">
//                   Create and publish new job openings to attract top talent
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="flex-grow flex flex-col justify-end">
//                 <Link href="/employer/post-job">
//                   <Button className="w-full gradient-bg text-white">Post New Job</Button>
//                 </Link>
//               </CardContent>
//             </Card>

//             <Card className="card-shadow border-0 card-hover bg-gradient-to-br from-emerald-50 to-emerald-100 flex flex-col h-full">
//               <CardHeader className="pb-3 flex-shrink-0">
//                 <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-3">
//                   <Users className="w-6 h-6 text-white" />
//                 </div>
//                 <CardTitle className="text-lg">HR Services</CardTitle>
//                 <CardDescription className="text-sm">
//                   Access comprehensive HR solutions for your business needs
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="flex-grow flex flex-col justify-end">
//                 <Link href="/employer/hr-services">
//                   <Button className="w-full gradient-bg text-white">Explore Services</Button>
//                 </Link>
//               </CardContent>
//             </Card>

//             <Card className="card-shadow border-0 card-hover bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col h-full">
//               <CardHeader className="pb-3 flex-shrink-0">
//                 <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-3">
//                   <MessageSquare className="w-6 h-6 text-white" />
//                 </div>
//                 <CardTitle className="text-lg">Premium Cart</CardTitle>
//                 <CardDescription className="text-sm">Review and manage your selected premium services</CardDescription>
//               </CardHeader>
//               <CardContent className="flex-grow flex flex-col justify-end">
//                 <Link href="/employer/cart">
//                   <Button className="w-full gradient-bg text-white">View Cart</Button>
//                 </Link>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Active Jobs & Recent Applications */}
//           <div className="grid lg:grid-cols-2 gap-6">
//             {/* Active Jobs */}
//             <Card className="card-shadow border-0">
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg">
//                   <Building className="w-4 h-4 mr-2 text-emerald-600" />
//                   Active Job Postings
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {dashboardStats?.topPerformingJobs && dashboardStats.topPerformingJobs.length > 0 ? (
//                   dashboardStats.topPerformingJobs.slice(0, 3).map((job: any, index: number) => {
//                     const gradients = [
//                       'from-emerald-50 to-emerald-100 border-emerald-200',
//                       'from-blue-50 to-blue-100 border-blue-200',
//                       'from-purple-50 to-purple-100 border-purple-200'
//                     ];
                    
//                     const formatDate = (dateString: string) => {
//                       const date = new Date(dateString);
//                       const now = new Date();
//                       const diffTime = Math.abs(now.getTime() - date.getTime());
//                       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
//                       if (diffDays === 1) return 'Posted today';
//                       if (diffDays === 2) return 'Posted 1 day ago';
//                       if (diffDays <= 7) return `Posted ${diffDays - 1} days ago`;
//                       if (diffDays <= 14) return 'Posted 1 week ago';
//                       return `Posted ${Math.ceil(diffDays / 7)} weeks ago`;
//                     };

//                     return (
//                       <div key={job._id} className={`p-3 bg-gradient-to-r ${gradients[index % 3]} rounded-lg border`}>
//                         <div className="flex justify-between items-start mb-2">
//                           <div className="flex-1">
//                             <h4 className="font-semibold">{job.title}</h4>
//                             <p className="text-xs text-gray-600">{formatDate(job.createdAt)}</p>
//                           </div>
//                           <Badge className={
//                             job.status === 'active' 
//                               ? "bg-green-100 text-green-800 text-xs"
//                               : job.status === 'paused'
//                               ? "bg-yellow-100 text-yellow-800 text-xs"
//                               : "bg-gray-100 text-gray-800 text-xs"
//                           }>
//                             {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
//                           </Badge>
//                         </div>
//                         <div className="flex items-center space-x-4 text-xs text-gray-600">
//                           <div className="flex items-center">
//                             <Eye className="w-3 h-3 mr-1" />
//                             -- views
//                           </div>
//                           <div className="flex items-center">
//                             <Users className="w-3 h-3 mr-1" />
//                             {job.applicationCount} applicants
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })
//                 ) : (
//                   <div className="p-6 text-center text-gray-500">
//                     <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
//                     <p className="text-sm">No active jobs found</p>
//                     <p className="text-xs text-gray-400 mt-1">Start by posting your first job!</p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Recent Applications */}
//             <Card className="card-shadow border-0">
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg">
//                   <UserPlus className="w-4 h-4 mr-2 text-emerald-600" />
//                   Recent Applications
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {dashboardStats?.recentApplications && dashboardStats.recentApplications.length > 0 ? (
//                   dashboardStats.recentApplications.slice(0, 5).map((app: any) => {
//                     const formatDate = (dateString: string) => {
//                       const date = new Date(dateString);
//                       const now = new Date();
//                       const diffTime = Math.abs(now.getTime() - date.getTime());
//                       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
//                       if (diffDays === 1) return 'Applied today';
//                       if (diffDays === 2) return 'Applied yesterday';
//                       if (diffDays <= 7) return `Applied ${diffDays - 1} days ago`;
//                       return `Applied ${Math.ceil(diffDays / 7)} weeks ago`;
//                     };

//                     return (
//                       <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                         <div className="flex-1">
//                           <h4 className="font-semibold text-sm">
//                             {app.applicantDetails?.name || 'Unknown Applicant'}
//                           </h4>
//                           <p className="text-xs text-gray-600">
//                             Applied for {app.jobDetails?.title || 'Unknown Position'}
//                           </p>
//                           <p className="text-xs text-gray-500 mt-1">
//                             {formatDate(app.appliedDate)}
//                           </p>
//                         </div>
//                         <div className="flex flex-col space-y-1">
//                           <Button 
//                             size="sm" 
//                             variant="outline" 
//                             className="bg-white text-xs h-7" 
//                             onClick={() => router.push(`/candidate/${app._id}`, { scroll: false })}
//                           >
//                             View
//                           </Button>
//                           <Dialog open={reviewOpen && selectedApp?._id === app._id} onOpenChange={open => { setReviewOpen(open); if (!open) setSelectedApp(null); }}>
//                             <Button size="sm" className="gradient-bg text-white text-xs h-7" onClick={() => { setSelectedApp(app); setReviewOpen(true); }}>Review</Button>
//                             <DialogContent>
//                               <DialogHeader>
//                                 <DialogTitle>Review Application</DialogTitle>
//                                 <DialogDescription>Rate, comment, and set status for this application</DialogDescription>
//                               </DialogHeader>
//                               <Card className="mb-2">
//                                 <CardContent>
//                                   <div className="mb-2">
//                                     <b>Rating:</b>
//                                     {[1,2,3,4,5].map(star => (
//                                       <span key={star} style={{ cursor: 'pointer', color: review.rating >= star ? '#10b981' : '#d1d5db' }} onClick={() => setReview(r => ({ ...r, rating: star }))}>★</span>
//                                     ))}
//                                   </div>
//                                   <div className="mb-2">
//                                     <b>Comments:</b>
//                                     <textarea className="w-full border rounded p-2 mt-1" rows={2} value={review.comments} onChange={e => setReview(r => ({ ...r, comments: e.target.value }))} />
//                                   </div>
//                                   <div className="mb-2">
//                                     <b>Status:</b>
//                                     <select className="w-full border rounded p-2 mt-1" value={review.status} onChange={e => setReview(r => ({ ...r, status: e.target.value }))}>
//                                       <option value="">Select status</option>
//                                       <option value="shortlisted">Shortlisted</option>
//                                       <option value="rejected">Rejected</option>
//                                       <option value="pending">On Hold</option>
//                                     </select>
//                                   </div>
//                                   <div className="mb-2">
//                                     <b>Email Response:</b>
//                                     <select className="w-full border rounded p-2 mt-1">
//                                       <option>Do not send</option>
//                                       <option>Send Interview Invite</option>
//                                       <option>Send Rejection</option>
//                                       <option>Send On Hold Notice</option>
//                                     </select>
//                                   </div>
//                                 </CardContent>
//                                 <CardFooter className="flex justify-between">
//                                   <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
//                                   <Button variant="default" className="bg-emerald-600 text-white" onClick={() => { setReview(r => ({ ...r, timestamp: new Date().toISOString() })); setReviewOpen(false); }}>Save</Button>
//                                 </CardFooter>
//                               </Card>
//                             </DialogContent>
//                           </Dialog>
//                         </div>
//                       </div>
//                     );
//                   })
//                 ) : (
//                   <div className="p-6 text-center text-gray-500">
//                     <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
//                     <p className="text-sm">No recent applications</p>
//                     <p className="text-xs text-gray-400 mt-1">Applications will appear here when candidates apply to your jobs</p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

"use client"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Users, Calendar, TrendingUp, Eye, MessageSquare, Building, UserPlus } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"
import { applications as applicationsData } from "@/lib/applications"

export default function EmployerDashboard() {
  const router = useRouter();
  // Add state for modals
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [review, setReview] = useState<{ rating: number; comments: string; status: string; timestamp: string | null }>({ rating: 0, comments: '', status: '', timestamp: null });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any pending redirect since we've reached the dashboard
    localStorage.removeItem('pendingRedirect');
    
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
        console.log('Employer Dashboard: Token found:', !!token);
        
        if (!token) {
          console.log('Employer Dashboard: No token, redirecting to login');
          router.push('/login');
          return;
        }

        // Fetch employer profile
        const profileResponse = await fetch('http://localhost:4000/api/v1/employer/details', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!profileResponse.ok) {
          console.log('Employer Dashboard: Profile API failed with status:', profileResponse.status);
          throw new Error('Failed to fetch profile');
        }

        const profileData = await profileResponse.json();
        console.log('Employer Dashboard: Profile data received:', profileData);
        setUserProfile(profileData.data);

        // Fetch dashboard statistics
        const statsResponse = await fetch('http://localhost:4000/api/v1/employer/dashboard/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        let statsData: any = {
          jobStats: { total: 0, active: 0, draft: 0, paused: 0, closed: 0 },
          applicationStats: { total: 0, pending: 0, shortlisted: 0, interviewScheduled: 0, hired: 0, rejected: 0 },
          recentApplications: [],
          topPerformingJobs: []
        };

        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          console.log('Employer Dashboard: Stats data received:', stats);
          statsData = stats.data;
        } else {
          console.log('Employer Dashboard: Stats API failed, proceeding with default values');
        }

        // Always try to fetch recent applications with proper population from jobs endpoint
        console.log('Employer Dashboard: Fetching recent applications from employer jobs');
        try {
          const allApplications: any[] = [];
          
          // First, get all employer jobs
          const jobsForAppsResponse = await fetch('http://localhost:4000/api/v1/employer/jobs', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (jobsForAppsResponse.ok) {
            const jobsData = await jobsForAppsResponse.json();
            console.log('Employer Dashboard: Jobs data for applications:', jobsData);
            
            // For each job, fetch its applications
            if (jobsData.data?.jobs && jobsData.data.jobs.length > 0) {
              for (const job of jobsData.data.jobs.slice(0, 5)) { // Limit to first 5 jobs for performance
                try {
                  const jobAppsResponse = await fetch(`http://localhost:4000/api/v1/applications/job/${job._id}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  });
                  
                  if (jobAppsResponse.ok) {
                    const jobAppsData = await jobAppsResponse.json();
                    if (jobAppsData.data && jobAppsData.data.length > 0) {
                      jobAppsData.data.forEach((app: any) => {
                        allApplications.push({
                          ...app,
                          jobDetails: {
                            title: job.title,
                            companyName: job.companyName
                          }
                        });
                      });
                    }
                  }
                } catch (jobError) {
                  console.error(`Error fetching applications for job ${job._id}:`, jobError);
                }
              }
              
              // Sort by application date and take recent ones
              allApplications.sort((a: any, b: any) => {
                const dateA = new Date(b.appliedDate || b.createdAt).getTime();
                const dateB = new Date(a.appliedDate || a.createdAt).getTime();
                return dateA - dateB;
              });
              if (allApplications.length > 0) {
                statsData.recentApplications = allApplications.slice(0, 10);
                console.log('Employer Dashboard: Successfully fetched recent applications:', statsData.recentApplications.length);
                console.log('Employer Dashboard: Application IDs:', statsData.recentApplications.map((app: any) => app._id));
              } else {
                console.log('Employer Dashboard: No applications found');
              }
            }
          }
        } catch (error) {
          console.error('Employer Dashboard: Error fetching recent applications:', error);
        }

        // Fetch active jobs from the jobs API
        const jobsResponse = await fetch('http://localhost:4000/api/v1/employer/jobs', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          console.log('Employer Dashboard: Jobs data received:', jobsData);
          statsData.topPerformingJobs = jobsData.data.jobs;
        } else {
          console.log('Employer Dashboard: Jobs API failed, using empty jobs array');
          statsData.topPerformingJobs = [];
        }

        setDashboardStats(statsData);
      } catch (error) {
        console.error('Employer Dashboard: Error fetching data:', error);
        // If token is invalid, redirect to login
        console.log('Employer Dashboard: Redirecting to login due to error');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Add state for metric card modals
  const [activeJobsOpen, setActiveJobsOpen] = useState(false);
  const [applicantsOpen, setApplicantsOpen] = useState(false);
  const [interviewsOpen, setInterviewsOpen] = useState(false);
  const [hiresOpen, setHiresOpen] = useState(false);

  // Use shared applications data
  const applications = applicationsData;

  // Mock data for modals
  const activeJobs = [
    { title: "Senior Software Engineer", posted: "2024-07-10", applicants: 12, status: "Active" },
    { title: "Marketing Manager", posted: "2024-07-07", applicants: 23, status: "Paused" },
    { title: "HR Coordinator", posted: "2024-07-03", applicants: 31, status: "Active" },
  ];
  const applicants = [
    { name: "Sarah Johnson", job: "Senior Software Engineer", date: "2024-07-12", status: "Shortlisted" },
    { name: "Michael Chen", job: "Marketing Manager", date: "2024-07-12", status: "Interview Scheduled" },
    { name: "Emma Wilson", job: "HR Coordinator", date: "2024-07-11", status: "Shortlisted" },
  ];
  const interviews = [
    { name: "Michael Chen", job: "Marketing Manager", datetime: "2024-07-15 10:00", interviewer: "Jane Smith" },
    { name: "Sarah Johnson", job: "Senior Software Engineer", datetime: "2024-07-16 14:00", interviewer: "Ahmed Ali" },
  ];
  const hires = [
    { name: "Emma Wilson", job: "HR Coordinator", date: "2024-07-10", onboarding: "Completed" },
    { name: "Sarah Johnson", job: "Senior Software Engineer", date: "2024-07-09", onboarding: "In Progress" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 card-shadow border-0">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 card-shadow border-0">
                  <div className="animate-pulse">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-8 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Header */}
          <div className="bg-white rounded-2xl p-6 card-shadow border-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-2xl font-bold mb-2">
                  Welcome back, {userProfile?.name || 'User'}!
                </h1>
                <p className="text-gray-600">Manage your recruitment activities and find top talent</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {dashboardStats?.jobStats?.active || userProfile?.activeJobs?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Active Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-600">
                    {dashboardStats?.applicationStats?.total || userProfile?.applications?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Applicants</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Active Jobs Card - now links to full page */}
            <Link href="/employer/active-jobs" className="cursor-pointer">
              <Card className="card-shadow border-0 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <PlusCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {dashboardStats?.jobStats?.active || userProfile?.activeJobs?.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Active Jobs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            {/* Applicants Card - now links to full page */}
            <Link href="/employer/applicants" className="cursor-pointer">
              <Card className="card-shadow border-0 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {dashboardStats?.applicationStats?.total || userProfile?.applications?.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Applicants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            {/* Interviews Card - now links to full page */}
            <Link href="/employer/interviews" className="cursor-pointer">
              <Card className="card-shadow border-0 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {dashboardStats?.applicationStats?.interviewScheduled || 0}
                      </p>
                      <p className="text-xs text-gray-600">Interviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            {/* Hires Card - now links to full page */}
            <Link href="/employer/hires" className="cursor-pointer">
              <Card className="card-shadow border-0 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {dashboardStats?.applicationStats?.hired || 0}
                      </p>
                      <p className="text-xs text-gray-600">Hires</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Modals for Metric Cards */}
          {/* Active Jobs Modal */}
          <Dialog open={activeJobsOpen} onOpenChange={setActiveJobsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Active Job Postings</DialogTitle>
                <DialogDescription>List of currently active job postings</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {activeJobs.map((job, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold">{job.title}</div>
                      <div className="text-xs text-gray-600">Posted: {job.posted}</div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
                      <span className="text-xs text-gray-600">Applicants: {job.applicants}</span>
                      <Badge className={job.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{job.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          {/* Applicants Modal */}
          <Dialog open={applicantsOpen} onOpenChange={setApplicantsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Applicants</DialogTitle>
                <DialogDescription>List of all applicants across active jobs</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {applicants.map((app, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold">{app.name}</div>
                      <div className="text-xs text-gray-600">Applied for: {app.job}</div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
                      <span className="text-xs text-gray-600">Date: {app.date}</span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">{app.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          {/* Interviews Modal */}
          <Dialog open={interviewsOpen} onOpenChange={setInterviewsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scheduled Interviews</DialogTitle>
                <DialogDescription>List of scheduled interviews</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {interviews.map((intv, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold">{intv.name}</div>
                      <div className="text-xs text-gray-600">Job: {intv.job}</div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
                      <span className="text-xs text-gray-600">Date & Time: {intv.datetime}</span>
                      <span className="text-xs text-gray-600">Interviewer: {intv.interviewer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          {/* Hires Modal */}
          <Dialog open={hiresOpen} onOpenChange={setHiresOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hired Candidates</DialogTitle>
                <DialogDescription>List of candidates marked as hired</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {hires.map((hire, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold">{hire.name}</div>
                      <div className="text-xs text-gray-600">Hired for: {hire.job}</div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
                      <span className="text-xs text-gray-600">Hiring Date: {hire.date}</span>
                      <Badge className={hire.onboarding === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{hire.onboarding}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Main Actions */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="card-shadow border-0 card-hover bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-3">
                  <PlusCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Post a Job</CardTitle>
                <CardDescription className="text-sm">
                  Create and publish new job openings to attract top talent
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <Button 
                  className="w-full gradient-bg text-white"
                  onClick={() => router.push('/employer/post-job')}
                >
                  Post New Job
                </Button>
              </CardContent>
            </Card>

            <Card className="card-shadow border-0 card-hover bg-gradient-to-br from-emerald-50 to-emerald-100 flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">HR Services</CardTitle>
                <CardDescription className="text-sm">
                  Access comprehensive HR solutions for your business needs
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <Link href="/employer/hr-services">
                  <Button className="w-full gradient-bg text-white">Explore Services</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-shadow border-0 card-hover bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Premium Cart</CardTitle>
                <CardDescription className="text-sm">Review and manage your selected premium services</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <Link href="/employer/cart">
                  <Button className="w-full gradient-bg text-white">View Cart</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Active Jobs & Recent Applications */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active Jobs */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Building className="w-4 h-4 mr-2 text-emerald-600" />
                  Active Job Postings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardStats?.topPerformingJobs && dashboardStats.topPerformingJobs.length > 0 ? (
                  dashboardStats.topPerformingJobs.slice(0, 3).map((job: any, index: number) => {
                    const gradients = [
                      'from-emerald-50 to-emerald-100 border-emerald-200',
                      'from-blue-50 to-blue-100 border-blue-200',
                      'from-purple-50 to-purple-100 border-purple-200'
                    ];
                    
                    const formatDate = (dateString: string) => {
                      const date = new Date(dateString);
                      const now = new Date();
                      const diffTime = Math.abs(now.getTime() - date.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      if (diffDays === 1) return 'Posted today';
                      if (diffDays === 2) return 'Posted 1 day ago';
                      if (diffDays <= 7) return `Posted ${diffDays - 1} days ago`;
                      if (diffDays <= 14) return 'Posted 1 week ago';
                      return `Posted ${Math.ceil(diffDays / 7)} weeks ago`;
                    };

                    return (
                      <div key={job._id} className={`p-3 bg-gradient-to-r ${gradients[index % 3]} rounded-lg border`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{job.title}</h4>
                            <p className="text-xs text-gray-600">{formatDate(job.createdAt)}</p>
                          </div>
                          <Badge className={
                            job.status === 'active' 
                              ? "bg-green-100 text-green-800 text-xs"
                              : job.status === 'paused'
                              ? "bg-yellow-100 text-yellow-800 text-xs"
                              : "bg-gray-100 text-gray-800 text-xs"
                          }>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {job.views || 0} views
                          </div>
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {job.applicationCount} applicants
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No active jobs found</p>
                    <p className="text-xs text-gray-400 mt-1">Start by posting your first job!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <UserPlus className="w-4 h-4 mr-2 text-emerald-600" />
                  Recent Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardStats?.recentApplications && dashboardStats.recentApplications.length > 0 ? (
                  dashboardStats.recentApplications.slice(0, 5).map((app: any) => {
                    const formatDate = (dateString: string) => {
                      const date = new Date(dateString);
                      const now = new Date();
                      const diffTime = Math.abs(now.getTime() - date.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      if (diffDays === 1) return 'Applied today';
                      if (diffDays === 2) return 'Applied yesterday';
                      if (diffDays <= 7) return `Applied ${diffDays - 1} days ago`;
                      return `Applied ${Math.ceil(diffDays / 7)} weeks ago`;
                    };

                    return (
                      <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {app.applicantDetails?.name || 'Unknown Applicant'}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Applied for {app.jobDetails?.title || 'Unknown Position'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(app.appliedDate)}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-white text-xs h-7" 
                            onClick={() => {
                              console.log('View Profile clicked for app:', app);
                              console.log('Using application ID:', app._id);
                              router.push(`/employer/applicants/profile/${app._id}`, { scroll: false });
                            }}
                          >
                            View Profile
                          </Button>
                          <Dialog open={reviewOpen && selectedApp?._id === app._id} onOpenChange={open => { setReviewOpen(open); if (!open) setSelectedApp(null); }}>
                            
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review Application</DialogTitle>
                                <DialogDescription>Rate & Comment the application</DialogDescription>
                              </DialogHeader>
                              <Card className="mb-2">
                                <CardContent>
                                  <div className="mb-2">
                                    <b>Rating:</b>
                                    {[1,2,3,4,5].map(star => (
                                      <span key={star} style={{ cursor: 'pointer', color: review.rating >= star ? '#10b981' : '#d1d5db' }} onClick={() => setReview(r => ({ ...r, rating: star }))}>★</span>
                                    ))}
                                  </div>
                                  <div className="mb-2">
                                    <b>Comments:</b>
                                    <textarea className="w-full border rounded p-2 mt-1" rows={2} value={review.comments} onChange={e => setReview(r => ({ ...r, comments: e.target.value }))} />
                                  </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                  <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
                                  <Button variant="default" className="bg-emerald-600 text-white" onClick={() => { setReview(r => ({ ...r, timestamp: new Date().toISOString() })); setReviewOpen(false); }}>Save</Button>
                                </CardFooter>
                              </Card>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No recent applications</p>
                    <p className="text-xs text-gray-400 mt-1">Applications will appear here when candidates apply to your jobs</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}