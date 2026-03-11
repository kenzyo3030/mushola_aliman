'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('all')

  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(d => {
      if (d.success) setEvents(d.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const filtered = activeType === 'all' ? events : events.filter(e => e.type === activeType)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="relative pt-16 h-64 islamic-pattern flex items-center justify-center">
        <div className="text-center text-white">
          <p className="font-arabic text-3xl text-yellow-300 mb-2">الأخبار والفعاليات</p>
          <h1 className="font-serif-custom text-4xl font-bold">Berita & Acara</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          {[{ value: 'all', label: 'Semua' }, { value: 'news', label: 'Berita' }, { value: 'event', label: 'Acara' }].map(tab => (
            <button key={tab.value} onClick={() => setActiveType(tab.value)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeType === tab.value
                  ? 'bg-green-700 text-white shadow-md'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Berita</h3>
            <p className="text-gray-400">Berita dan acara masjid akan segera ditambahkan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <article key={event.id} className="bg-white rounded-2xl shadow-md overflow-hidden card-hover border border-green-100">
                {event.imageUrl ? (
                  <div className="h-52 overflow-hidden">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  </div>
                ) : (
                  <div className="h-24 islamic-pattern flex items-center justify-center">
                    <span className="text-3xl">{event.type === 'news' ? '📰' : '📅'}</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      event.type === 'news' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {event.type === 'news' ? '📰 Berita' : '📅 Acara'}
                    </span>
                  </div>
                  {event.date && (
                    <p className="text-xs text-gray-400 mb-2 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <h2 className="font-bold text-green-900 text-lg mb-2 leading-tight">{event.title}</h2>
                  {event.description && <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{event.description}</p>}
                  {event.location && (
                    <p className="text-xs text-green-600 mt-3 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      {event.location}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
