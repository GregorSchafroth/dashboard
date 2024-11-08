// lib/utils.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Project } from '@prisma/client'
import { prisma } from '@/lib/prisma' // Use the singleton instance
import { Logger } from '@/utils/debug'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a project name to a URL-friendly slug
 * @param name The project name to convert (e.g., "Test Project")
 * @returns The URL slug (e.g., "test-project")
 */
export function slugify(name: string): string {
  return name
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing whitespace
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
}

/**
 * Converts a URL slug back to a properly formatted project name
 * @param slug The URL slug to convert (e.g., "test-project")
 * @returns The formatted project name (e.g., "Test Project")
 */
export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
    .join(' ')
}

/**
 * Type guard to check if a string is a valid slug
 * @param str The string to check
 * @returns boolean indicating if the string is a valid slug
 */
export function isValidSlug(str: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(str)
}

export async function getProjectFromSlug(
  projectSlug: string | undefined
): Promise<Project | null> {
  try {
    if (!projectSlug) {
      Logger.prisma('No project name provided')
      return null
    }

    const formattedProjectName = unslugify(projectSlug)
    Logger.prisma(
      `Looking for project: "${formattedProjectName}" (from URL: "${projectSlug}")`
    )

    const project = await prisma.project.findFirst({
      where: {
        name: formattedProjectName,
      },
    })

    if (!project) {
      Logger.prisma(`Project not found: ${formattedProjectName}`)
      return null
    }

    Logger.prisma(`Found project: ${project.name} (ID: ${project.id})`)
    return project
  } catch (error) {
    console.error('Error fetching project ID:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
