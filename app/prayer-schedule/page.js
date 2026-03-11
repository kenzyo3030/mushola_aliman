'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrayerSchedulePage() {
  const [schedule, setSchedule] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('/api/prayer-schedule').then(r => r.json()).then(d => {
      if (d.success) setSchedule(d.data || {})
    }).finally(() => setLoading(false))
  }, [])

  const prayers = [
    { name: 'Subuh', arabicName: 'فجر', time: schedule.fajr, jamaah: schedule.subuhJamaah, icon: '🌅', desc: 'Sholat fajar sebelum terbit matahari', color: 'from-blue-900 to-blue-700' },
    { name: 'Dzuhur', arabicName: 'ظهر', time: schedule.dhuhr, jamaah: schedule.dzuhurJamaah, icon: '☀️', desc: 'Sholat tengah hari', color: 'from-yellow-600 to-yellow-500' },
    { name: 'Ashar', arabicName: 'عصر', time: schedule.asr, jamaah: schedule.asrJamaah, icon: '🌄', desc: 'Sholat sore hari', color: 'from-orange-600 to-orange-500' },
    { name: 'Maghrib', arabicName: 'مغرب', time: schedule.maghrib, jamaah: schedule.maghribJamaah, icon: '🌇', desc: 'Sholat setelah terbenam matahari', color: 'from-red-800 to-red-700' },
    { name: 'Isya', arabicName: 'عشاء', time: schedule.isha, jamaah: schedule.isyaJamaah, icon: '🌙', desc: 'Sholat malam', color: 'from-indigo-900 to-indigo-800' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="relative pt-16 h-64 islamic-pattern flex items-center justify-center">
        <div className="text-center text-white">
          <p className="font-arabic text-3xl text-yellow-300 mb-2">أوقات الصلاة</p>
          <h1 className="font-serif-custom text-4xl font-bold">Jadwal Waktu Sholat</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Time Display */}
        <div className="bg-green-700 text-white rounded-2xl p-6 text-center mb-10 shadow-xl">
          <p className="text-green-200 text-sm mb-1">{currentDate}</p>
          <p className="font-mono text-5xl font-bold text-yellow-300">{currentTime}</p>
          <p className="text-green-200 text-sm mt-2">Waktu Indonesia Barat (WIB)</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {prayers.map(prayer => (
                <div key={prayer.name} className={`bg-gradient-to-r ${prayer.color} text-white rounded-2xl p-5 shadow-lg flex items-center justify-between`}>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{prayer.icon}</div>
                    <div>
                      <p className="font-arabic text-xl text-yellow-300">{prayer.arabicName}</p>
                      <p className="font-bold text-xl">{prayer.name}</p>
                      <p className="text-sm text-white/70">{prayer.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/70 mb-1">Waktu</p>
                    <p className="font-mono font-bold text-3xl text-yellow-300">{prayer.time || '--:--'}</p>
                    {prayer.jamaah && (
                      <p className="text-sm text-white/80 mt-1">Jamaah: <span className="font-semibold">{prayer.jamaah}</span></p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Jumat */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">🕌</div>
                  <div>
                    <p className="font-arabic text-xl text-green-700">جمعة</p>
                    <p className="font-bold text-xl text-green-900">Sholat Jumat</p>
                    <p className="text-sm text-gray-500">Setiap hari Jumat</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Waktu</p>
                  <p className="font-mono font-bold text-3xl text-green-700">{schedule.jumuah || '12:00'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm text-green-700 text-center">
                ⚠️ Jadwal sholat dapat berubah sesuai dengan kalender Hijriyah dan keputusan MUI setempat
              </p>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}