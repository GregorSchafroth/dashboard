'use client'

import React, { useState, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea, TextareaProps } from '@/components/ui/textarea'
import { Trash2, Undo2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { syncWithVoiceflow } from '../services/voiceflow'
import { Logger } from '@/utils/debug'
import { useTranslation } from '@/hooks/useTranslation'

type FAQ = {
  id?: number
  question: string
  answer: string
  markedForDeletion?: boolean
}

type EditableKnowledgeBaseProps = {
  initialFaqs: FAQ[]
  onSave: (faqs: FAQ[]) => Promise<{ success: boolean; error?: string }>
  voiceflowApiKey: string
}

type AutoResizeTextareaProps = Omit<TextareaProps, 'ref'> & {
  value: string
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  disabled?: boolean
}

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ value, onChange, disabled, ...props }, forwardedRef) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <Textarea
      ref={(element) => {
        textareaRef.current = element
        if (typeof forwardedRef === 'function') {
          forwardedRef(element)
        } else if (forwardedRef) {
          forwardedRef.current = element
        }
      }}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={1}
      style={{ overflow: 'hidden' }}
      {...props}
    />
  )
})
AutoResizeTextarea.displayName = 'AutoResizeTextarea'

const EditableKnowledgeBase = ({
  initialFaqs,
  onSave,
  voiceflowApiKey,
}: EditableKnowledgeBaseProps) => {
  const [faqs, setFaqs] = useState<FAQ[]>(
    initialFaqs.map((faq) => ({ ...faq, markedForDeletion: false }))
  )
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '', markedForDeletion: false }])
  }

  const toggleDelete = (index: number) => {
    const newFaqs = [...faqs]
    newFaqs[index] = {
      ...newFaqs[index],
      markedForDeletion: !newFaqs[index].markedForDeletion,
    }
    setFaqs(newFaqs)
  }

  const updateFaq = (
    index: number,
    field: 'question' | 'answer',
    value: string
  ) => {
    const newFaqs = [...faqs]
    newFaqs[index] = { ...newFaqs[index], [field]: value }
    setFaqs(newFaqs)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const faqsToSave = faqs.filter((faq) => !faq.markedForDeletion)

      const result = await onSave(faqsToSave)

      if (result.success) {
        Logger.progress('Starting Voiceflow sync...')
        const voiceflowResult = await syncWithVoiceflow(
          faqsToSave,
          voiceflowApiKey
        )

        if (voiceflowResult.success) {
          setFaqs(faqsToSave)
          toast({
            title: t('knowledge.toast.success.title'),
            description: t('knowledge.toast.success.description'),
            duration: 3000,
          })
        } else {
          Logger.error('Voiceflow sync error:', voiceflowResult.error)
          toast({
            variant: 'destructive',
            title: t('knowledge.toast.warning.title'),
            description:
              t('knowledge.toast.warning.description') +
              ': ' +
              voiceflowResult.error,
            duration: 60000,
          })
        }
      } else {
        toast({
          variant: 'destructive',
          title: t('knowledge.toast.error.title'),
          description: result.error || t('knowledge.toast.error.description'),
          duration: 60000,
        })
      }
    } catch (error) {
      Logger.error('Save operation error:', error)
      toast({
        variant: 'destructive',
        title: t('knowledge.toast.error.title'),
        description:
          error instanceof Error
            ? error.message
            : t('knowledge.toast.error.description'),
        duration: 60000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      {faqs.map((faq, index) => (
        <div
          key={index}
          className={`flex flex-col p-4 border rounded-lg bg-card transition-all duration-200 ${
            faq.markedForDeletion ? 'opacity-50 bg-red-50 dark:bg-red-950' : ''
          }`}
        >
          <div className='flex items-start justify-between'>
            <div className='flex gap-2 flex-1'>
              <AutoResizeTextarea
                placeholder={t('knowledge.placeholders.question')}
                value={faq.question}
                onChange={(e) => updateFaq(index, 'question', e.target.value)}
                className='w-full min-h-[38px] resize-none'
                disabled={faq.markedForDeletion}
              />
              <AutoResizeTextarea
                placeholder={t('knowledge.placeholders.answer')}
                value={faq.answer}
                onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                className='w-full min-h-[38px] resize-none'
                disabled={faq.markedForDeletion}
              />
            </div>
            <Button
              variant={faq.markedForDeletion ? 'destructive' : 'ghost'}
              size='icon'
              className='ml-2'
              onClick={() => toggleDelete(index)}
            >
              {faq.markedForDeletion ? (
                <Undo2 className='h-4 w-4' />
              ) : (
                <Trash2 className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>
      ))}
      <div className='flex justify-between'>
        <Button onClick={addFaq}>{t('knowledge.addQuestion')}</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? t('knowledge.saving') : t('knowledge.saveChanges')}
        </Button>
      </div>
    </div>
  )
}

export default EditableKnowledgeBase
