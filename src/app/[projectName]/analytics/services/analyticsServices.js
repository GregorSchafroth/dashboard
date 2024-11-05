import { currentUser } from '@clerk/nextjs/server';

async function getApiKey() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  let apiKey = '';

  if (userEmail === 'gregor.schafroth@gmail.com') {
    apiKey = process.env.FT_VOICEFLOW_API_KEY;
  } else if (userEmail === 'antonio@flyingteachers.com') {
    apiKey = process.env.FT_VOICEFLOW_API_KEY;
  } else if (userEmail === 'support@flyingteachers.com') {
    apiKey = process.env.FT_VOICEFLOW_API_KEY;
  } else if (userEmail === 'sollkrash@gmail.com') {
    apiKey = process.env.HD_VOICEFLOW_API_KEY;
  } else if (userEmail === 'leitung@hallodeutschschule.ch') {
    apiKey = process.env.HD_VOICEFLOW_API_KEY;
  }

  return apiKey;
}

export async function getSessions(projectID, startDay, endDay) {
  const apiKey = await getApiKey();

  const url = 'https://analytics-api.voiceflow.com/v1/query/usage';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: apiKey,
    },
    body: JSON.stringify({
      query: [
        {
          name: 'sessions',
          filter: {
            projectID: projectID,
            startTime: `${startDay}T00:00:00.000Z`,
            endTime: `${endDay}T23:59:59.999Z`,
           },
        },
      ],
    }),
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return res.json();
}
