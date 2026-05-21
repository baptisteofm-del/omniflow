'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CalendarPost {
  id: string
  date: string
  platforms: string[]
  status: 'pending' | 'posted' | 'failed'
}

interface PostCalendarProps {
  posts: CalendarPost[]
}

export function PostCalendar({ posts }: PostCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getPostsForDay = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
      .toISOString()
      .split('T')[0]

    return posts.filter((p) => p.date.split('T')[0] === dateStr)
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ]

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="glass rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty days from previous month */}
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of current month */}
        {days.map((day) => {
          const dayPosts = getPostsForDay(day)
          const hasPost = dayPosts.length > 0
          const today =
            new Date().toDateString() ===
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            ).toDateString()

          return (
            <div
              key={day}
              className={`aspect-square rounded-lg p-1 text-xs transition-all ${
                today
                  ? 'bg-purple-500/20 border border-purple-500/50'
                  : hasPost
                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                    : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold mb-1">{day}</div>
              {dayPosts.length > 0 && (
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className={`px-1 py-0.5 rounded text-xs font-medium text-white ${
                        post.status === 'posted'
                          ? 'bg-green-500/30'
                          : post.status === 'failed'
                            ? 'bg-red-500/30'
                            : 'bg-blue-500/30'
                      }`}
                    >
                      {post.platforms[0]}
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayPosts.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
