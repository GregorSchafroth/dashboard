import getProjectIdFromName from "@/lib/db/getProjectFromName"

export default async function Page({ params }: { params: { projectName: string } }) {
  // Need to await the params first
  const { projectName } = await params
  const projectId = await getProjectIdFromName(projectName)
  
  console.log('Project ID:', projectId)

  return (
    <div>page</div>
  )
}

// import Analytics from './components/Analytics'
// import { getSessions } from './services/analyticsServices';

// type Props = {
//   projectName: string
// }

// const page = async ({ projectName }: Props) => {
//   let dailyData = [];
//   let monthlyData = [];

//   try {
//     const today = new Date();

//     // Helper function to format dates
//     const formatDate = (date) => date.toISOString().split('T')[0];

//     // Fetching data for the last 7 days
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(today.getDate() - 6); // We go back 6 days for 7-day period

//     const sevenDaysPromises = [];
//     for (let i = 0; i < 7; i++) {
//       const currentDate = new Date(sevenDaysAgo);
//       currentDate.setDate(sevenDaysAgo.getDate() + i);
//       const formattedDate = formatDate(currentDate);

//       // Store both the date and the session promise
//       sevenDaysPromises.push({ date: formattedDate, promise: getSessions(params.projectID, formattedDate, formattedDate) });
//     }

//     // Wait for all promises to resolve
//     const sevenDaysResults = await Promise.all(sevenDaysPromises.map(p => p.promise));

//     // Combine the date with the corresponding session count
//     dailyData = sevenDaysPromises.map((p, index) => ({
//       date: p.date,
//       count: sevenDaysResults[index].result[0].count
//     }));

//     // Fetching data for the last 12 months
//     const monthsPromises = [];
//     for (let i = 0; i < 12; i++) {
//       const startOfMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
//       const endOfMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

//       // Format dates for the start and end of each month
//       const startDate = formatDate(startOfMonth);
//       const endDate = formatDate(endOfMonth);

//       // Store both the month and the session promise
//       monthsPromises.push({ month: startDate, promise: getSessions(params.projectID, startDate, endDate) });
//     }

//     // Wait for all promises to resolve
//     const monthsResults = await Promise.all(monthsPromises.map(p => p.promise));

//     // Combine the month with the corresponding session count
//     monthlyData = monthsPromises.map((p, index) => ({
//       date: p.month,
//       count: monthsResults[index].result[0].count
//     }));

//     // Sort monthly data from oldest to newest
//     monthlyData.sort((a, b) => new Date(a.date) - new Date(b.date));

//   } catch (error) {
//     console.error('Failed to load session data:', error);
//   }

//   console.log('Daily session data:', dailyData);
//   console.log('Monthly session data:', monthlyData);

//   return (
//     <Analytics dailyData={dailyData} monthlyData={monthlyData} />
//   );
// };

// export default page;
