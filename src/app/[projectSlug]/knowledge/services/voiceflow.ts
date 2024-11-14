import { Logger } from "@/utils/debug"

type FAQ = {
  id?: number
  question: string
  answer: string
  markedForDeletion?: boolean
}

type VoiceflowConfig = {
  apiKey: string
}

type VoiceflowDocument = {
  documentID: string
  data: {
    name: string
    schema?: {
      searchableFields: string[]
      metadataFields: string[]
    }
    items?: Array<{
      question: string
      answer: string
    }>
  }
}

type VoiceflowDocumentList = {
  data: VoiceflowDocument[]
  page: number
  limit: number
  total: number
}

export class VoiceflowService {
  private apiKey: string

  constructor(config: VoiceflowConfig) {
    this.apiKey = config.apiKey
  }

  private async getFAQDocumentId(): Promise<string | null> {
    try {
      const response = await fetch(
        'https://api.voiceflow.com/v1/knowledge-base/docs?page=1&limit=100',
        {
          headers: {
            Authorization: this.apiKey,
            accept: 'application/json',
          },
        }
      )

      // Handle 404 or empty knowledge base specifically
      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        throw new Error(`Failed to get documents: ${response.statusText}`)
      }

      const documentList = (await response.json()) as VoiceflowDocumentList

      // Handle case where the response is successful but there are no documents
      if (!documentList.data || documentList.data.length === 0) {
        return null
      }

      const faqDocument = documentList.data.find(
        (doc) => doc.data.name === 'FAQs'
      )

      return faqDocument ? faqDocument.documentID : null
    } catch (error) {
      // Log the error but don't throw it - return null instead
      Logger.error('Error getting FAQ document ID:', error)
      return null
    }
  }

  private async deleteExistingFAQ(documentId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.voiceflow.com/v1/knowledge-base/docs/${documentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: this.apiKey,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`)
      }

      return true
    } catch (error) {
      Logger.error('Error deleting document:', error)
      throw error
    }
  }

  async updateKnowledgeBase(
    items: FAQ[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. First get the existing FAQ document ID
      const existingDocId = await this.getFAQDocumentId()

      // 2. If there's an existing FAQ, attempt to delete it
      if (existingDocId) {
        try {
          await this.deleteExistingFAQ(existingDocId)
        } catch (error) {
          Logger.error('Error deleting existing FAQ:', error)
          // Continue with upload even if delete fails
        }
      }

      // 3. Upload new FAQs
      const response = await fetch(
        'https://api.voiceflow.com/v1/knowledge-base/docs/upload/table',
        {
          method: 'POST',
          headers: {
            Authorization: this.apiKey,
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              schema: {
                searchableFields: ['question', 'answer'],
                metadataFields: ['tags'],
              },
              name: 'FAQs',
              items: items.map(({ question, answer }) => ({
                question,
                answer,
              })),
            },
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Failed to update Voiceflow knowledge base'
        )
      }

      return { success: true }
    } catch (error) {
      Logger.error('Error updating Voiceflow knowledge base:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
}

export const syncWithVoiceflow = async (
  faqs: FAQ[],
  apiKey: string
): Promise<{ success: boolean; error?: string }> => {
  const voiceflow = new VoiceflowService({ apiKey })
  return await voiceflow.updateKnowledgeBase(faqs)
}
