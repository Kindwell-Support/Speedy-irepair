import {defineField} from 'sanity'
import {orderRankField} from '@sanity/orderable-document-list'

/** Hidden `orderRank` string managed by @sanity/orderable-document-list (drag-to-reorder in Studio). */
export const rankField = (type: string) => orderRankField({type})

export const isPlaceholderField = defineField({
  name: 'isPlaceholder',
  title: 'Placeholder (not real content)',
  type: 'boolean',
  initialValue: false,
  description: 'Placeholders render as placeholder UI and never emit structured data.',
})

export const flaggedForReviewField = defineField({
  name: 'flaggedForReview',
  title: 'Flagged for client review',
  type: 'boolean',
  initialValue: false,
})

export const seoField = defineField({
  name: 'seo',
  title: 'SEO',
  type: 'seo',
  group: 'seo',
  validation: (r) => r.required(),
})

export const seoGroups = [
  {name: 'content', title: 'Content', default: true},
  {name: 'seo', title: 'SEO'},
]

export const heroField = defineField({name: 'hero', type: 'hero', group: 'content', validation: (r) => r.required()})

export const wordCount = (s?: string) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0)
