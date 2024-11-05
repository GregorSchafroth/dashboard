import { PrismaClient, Project } from '@prisma/client'

function formatProjectName(urlProjectName: string | undefined): string {
  if (!urlProjectName) {
    throw new Error('Project name is required')
  }

  return urlProjectName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default async function getProjectIdFromName(
  urlProjectName: string | undefined
): Promise<Project | null> {
  const prisma = new PrismaClient()

  try {
    if (!urlProjectName) {
      console.log('No project name provided')
      return null
    }

    const formattedProjectName = formatProjectName(urlProjectName)
    console.log(
      `Looking for project: "${formattedProjectName}" (from URL: "${urlProjectName}")`
    )

    const project = await prisma.project.findFirst({
      where: {
        name: formattedProjectName,
      }
    })

    if (!project) {
      console.log(`Project not found: ${formattedProjectName}`)
      return null
    }

    console.log(`Found project: ${project.name} (ID: ${project.id})`)
    return project
  } catch (error) {
    console.error('Error fetching project ID:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
