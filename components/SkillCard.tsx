'use client'

import Link from 'next/link'
import { DIFF_BG, DIFF_COLOR } from '@/lib/constants'

type Skill = {
  id: string
  name: string
  description: string
  subject: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  price: number
  is_free: boolean
  rating_avg: number
  rating_count: number
  profiles?: {
    username: string | null
    full_name: string | null
  }
}

export default function SkillCard({ skill }: { skill: Skill }) {
  const sellerName = skill.profiles?.full_name || skill.profiles?.username || 'Anonymous'

  return (
    <Link
      href={`/skills/${skill.id}`}
      className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="font-medium text-lg leading-tight">{skill.name}</h3>
        <span className="text-lg font-semibold text-brand-primary shrink-0">
          {skill.is_free ? 'Free' : `$${skill.price}`}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        <span className="text-xs px-3 py-1 rounded-full bg-brand-light text-brand-dark font-medium">
          {skill.subject}
        </span>
        <span
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{
            backgroundColor: DIFF_BG[skill.difficulty],
            color: DIFF_COLOR[skill.difficulty],
          }}
        >
          {skill.difficulty}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {skill.description}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
        <span>by {sellerName}</span>
        {skill.rating_count > 0 && (
          <span>
            ⭐ {skill.rating_avg.toFixed(1)} ({skill.rating_count})
          </span>
        )}
      </div>
    </Link>
  )
}
