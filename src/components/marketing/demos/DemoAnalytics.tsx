'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'

interface Model {
  name: string
  revenue: number
  percentage: number
  color: string
}

const models: Model[] = [
  { name: 'Carla', revenue: 4200, percentage: 68, color: 'from-purple-500 to-purple-600' },
  { name: 'Victoria', revenue: 3100, percentage: 50, color: 'from-pink-500 to-pink-600' },
  { name: 'Mia', revenue: 2800, percentage: 45, color: 'from-cyan-500 to-cyan-600' },
]

const monthlyData = [
  { month: 'Jan', value: 8200 },
  { month: 'Feb', value: 9100 },
  { month: 'Mar', value: 10300 },
  { month: 'Avr', value: 11800 },
  { month: 'Mai', value: 12400 },
]

export function DemoAnalytics() {
  const [animatedRevenue, setAnimatedRevenue] = useState(0)
  const [animatedAI, setAnimatedAI] = useState(0)
  const [animatedBars, setAnimatedBars] = useState(models.map(() => 0))

  const totalRevenue = 12400
  const aiCommission = 1240

  useEffect(() => {
    let count = 0
    const revInterval = setInterval(() => {
      count += totalRevenue / 50
      if (count >= totalRevenue) {
        setAnimatedRevenue(totalRevenue)
        clearInterval(revInterval)
      } else {
        setAnimatedRevenue(Math.round(count))
      }
    }, 20)

    return () => clearInterval(revInterval)
  }, [])

  useEffect(() => {
    let count = 0
    const aiInterval = setInterval(() => {
      count += aiCommission / 40
      if (count >= aiCommission) {
        setAnimatedAI(aiCommission)
        clearInterval(aiInterval)
      } else {
        setAnimatedAI(Math.round(count))
      }
    }, 20)

    return () => clearInterval(aiInterval)
  }, [])

  useEffect(() => {
    const barInterval = setInterval(() => {
      setAnimatedBars((prev) =>
        prev.map((v, idx) => {
          const target = (models[idx].revenue / totalRevenue) * 100
          return Math.min(v + target / 30, target)
        })
      )
    }, 20)

    return () => clearInterval(barInterval)
  }, [])

  const maxRevenue = Math.max(...monthlyData.map((d) => d.value))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="rounded-2xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-2xl shadow-purple-900/50">
        {/* Window bar */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-b border-purple-500/20 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-gray-400 text-xs font-medium ml-auto">Dashboard Agence</span>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-green-400" />
              Dashboard Financier
            </h3>
            <p className="text-gray-400 text-xs">Suivi temps reel de vos revenus et commissions IA</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {/* Monthly revenue */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 backdrop-blur"
            >
              <div className="text-xs font-semibold text-green-400 mb-2">Ce mois</div>
              <div className="text-3xl font-bold text-white mb-1">{animatedRevenue.toLocaleString()}€</div>
              <div className="text-xs text-green-400">+24% vs M-1</div>
            </motion.div>

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 backdrop-blur col-span-2"
            >
              <div className="text-xs font-semibold text-purple-400 mb-3">Tendance (5 derniers mois)</div>
              <div className="flex items-end gap-2 h-16">
                {monthlyData.map((data, idx) => (
                  <motion.div
                    key={data.month}
                    initial={{ height: '0%' }}
                    animate={{ height: `${(data.value / maxRevenue) * 100}%` }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.6 }}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan-500 to-purple-500 cursor-pointer hover:opacity-80 transition-opacity"
                    title={`${data.month}: ${data.value}€`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                {monthlyData.map((data) => (
                  <span key={data.month}>{data.month}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Models ranking */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="text-sm font-bold text-white">Top modeles</h4>
            {models.map((model, idx) => (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-yellow-400">
                      {idx === 0 && '🥇'}
                      {idx === 1 && '🥈'}
                      {idx === 2 && '🥉'}
                    </span>
                    <span className="font-semibold text-white text-sm">{model.name}</span>
                  </div>
                  <span className="font-bold text-white">{model.revenue.toLocaleString()}€</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${animatedBars[idx]}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${model.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* AI Commission */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-cyan-400 mb-1">Commission IA Chatting ce mois</div>
                <div className="text-2xl font-bold text-white">{animatedAI.toLocaleString()}€</div>
              </div>
              <div className="text-3xl">🤖</div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
