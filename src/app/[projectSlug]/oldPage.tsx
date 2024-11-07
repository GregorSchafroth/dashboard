// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   ChartContainer,
//   ChartTooltipContent,
//   ChartConfig
// } from "@/components/ui/chart"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Users, MessageSquare, ArrowUpRight } from "lucide-react"
// import Link from "next/link"
// import AnalyticsPage from "./analytics/page"

// const DashboardPage = ({ params }: { params: { projectName: string } }) => {
//   // Mock data for the area chart
//   const mockDailyData = [
//     { date: '2024-03-01', count: 0 },
//     { date: '2024-03-02', count: 0 },
//     { date: '2024-03-03', count: 0 },
//     { date: '2024-03-04', count: 0 },
//     { date: '2024-03-05', count: 0 },
//     { date: '2024-03-06', count: 0 },
//     { date: '2024-03-07', count: 0 }
//   ]

//   // Mock data for recent transcripts
//   const mockTranscripts = [
//     {
//       id: "1",
//       date: "2024-03-07",
//       title: "Customer Support Call",
//       summary: "Discussion about product features and technical setup with new client."
//     },
//     {
//       id: "2",
//       date: "2024-03-06",
//       title: "Sales Team Meeting",
//       summary: "Quarterly review of sales targets and strategy planning for Q2."
//     },
//     {
//       id: "3",
//       date: "2024-03-05",
//       title: "Product Demo",
//       summary: "Walkthrough of new features with potential enterprise customer."
//     },
//     {
//       id: "4",
//       date: "2024-03-04",
//       title: "Team Standup",
//       summary: "Daily update on project progress and upcoming milestones."
//     }
//   ]

//   const chartConfig: ChartConfig = {
//     count: {
//       label: "Session Count",
//       color: "hsl(var(--chart-1))",
//     },
//   }

//   const formatAxisDate = (date: string): string => {
//     const options: Intl.DateTimeFormatOptions = { 
//       weekday: 'short', 
//       day: 'numeric' 
//     }
//     return new Date(date).toLocaleDateString(undefined, options)
//   }

//   return (
//     <div className="flex flex-col gap-4 p-4">
//       {/* Stats Overview */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Users</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">0</div>
//             <p className="text-xs text-muted-foreground">
//               Lifetime platform users
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Transcripts</CardTitle>
//             <MessageSquare className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">0</div>
//             <p className="text-xs text-muted-foreground">
//               Conversations recorded
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Main Content */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
//         {/* Analytics Chart */}
//         <Card className="col-span-1">
//           <CardHeader>
//             <CardTitle>Recent Activity</CardTitle>
//             <CardDescription>
//               User sessions over the past 7 days
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer config={chartConfig}>
              
//             </ChartContainer>
//           </CardContent>
//         </Card>

//         {/* Recent Transcripts */}
//         <Card className="col-span-1">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0">
//             <div>
//               <CardTitle>Recent Transcripts</CardTitle>
//               <CardDescription>
//                 Latest conversation transcripts
//               </CardDescription>
//             </div>
//             <Link 
//               href={`/${params.projectName}/transcripts`}
//               className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
//             >
//               View all
//               <ArrowUpRight className="ml-1 h-4 w-4" />
//             </Link>
//           </CardHeader>
//           <CardContent>
//             <ScrollArea className="h-[300px] w-full">
//               <div className="space-y-4">
//                 {mockTranscripts.map((transcript) => (
//                   <Link
//                     key={transcript.id}
//                     href={`/${params.projectName}/transcripts/${transcript.id}`}
//                   >
//                     <div className="flex flex-col space-y-1 rounded-md p-3 hover:bg-muted">
//                       <div className="flex items-center justify-between">
//                         <h4 className="font-medium leading-none">
//                           {transcript.title}
//                         </h4>
//                         <span className="text-sm text-muted-foreground">
//                           {new Date(transcript.date).toLocaleDateString()}
//                         </span>
//                       </div>
//                       <p className="text-sm text-muted-foreground line-clamp-2">
//                         {transcript.summary}
//                       </p>
//                     </div>
//                   </Link>
//                 ))}
//               </div>
//             </ScrollArea>
//           </CardContent>
//         </Card>
//       </div>
//       <div>
//         <AnalyticsPage projectName="saia-2" />
//       </div>
//     </div>
//   )
// }

// export default DashboardPage