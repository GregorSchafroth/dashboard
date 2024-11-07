// scripts/populate-slugs.ts

import prisma from "@/lib/prisma"
import { slugify } from "@/lib/utils"

async function populateSlugs() {
  const projects = await prisma.project.findMany()
  
  for (const project of projects) {
    await prisma.project.update({
      where: { id: project.id },
      data: {
        slug: slugify(project.name)
      }
    })
  }
}

populateSlugs()
  .then(() => console.log('Slugs populated successfully'))
  .catch(console.error)
  .finally(() => prisma.$disconnect())