'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AboutPage() {
  const [profile, setProfile] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mosque-profile').then(r => r.json()).then(d => {
      if (d.success) setProfile(d.data || {})
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative pt-16 h-64 islamic-pattern flex items-center justify-center">
        <div className="text-center text-white">
          <p className="font-arabic text-3xl text-yellow-300 mb-2">تعرف على مصلانا</p>
          <h1 className="font-serif-custom text-4xl font-bold">Tentang Mushola</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Profile Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <p className="font-arabic text-green-700 text-2xl mb-1">{profile.arabicName || 'مصلى الإيمان'}</p>
                <h2 className="font-serif-custom text-4xl font-bold text-green-900 mb-4">{profile.name || 'Mushola Al-Iman'}</h2>
                <hr className="section-divider mb-6" />
                <p className="text-gray-600 leading-relaxed text-lg mb-6">{profile.description || 'Mushola Al-Iman adalah tempat ibadah yang berkomitmen untuk menjadi pusat kegiatan Islam yang membawa rahmat bagi seluruh masyarakat.'}</p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1535117423468-de0ff056882e?w=800&q=80" alt="Masjid" className="w-full h-80 object-cover" />
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { label: 'Tahun Berdiri', value: profile.yearEstablished || '2025', icon: '🏛️', color: 'bg-green-50 border-green-200' },
                { label: 'Kapasitas Jamaah', value: `${profile.capacity || '100'} Orang`, icon: '🧕', color: 'bg-yellow-50 border-yellow-200' },
                { label: 'Imam Masjid', value: profile.imamName || 'Ustadz Ahmad Fauzi', icon: '📿', color: 'bg-green-50 border-green-200' },
                { label: 'Khatib Jumat', value: profile.khatibName || 'Ustadz Muhammad Ridwan', icon: '🎤', color: 'bg-yellow-50 border-yellow-200' },
              ].map(item => (
                <div key={item.label} className={`rounded-xl p-5 border ${item.color} card-hover`}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                  <p className="font-semibold text-green-800">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Vision Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-green-700 text-white rounded-2xl p-8 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mr-3 text-xl">🌟</div>
                  <h3 className="font-serif-custom text-2xl font-bold">Visi</h3>
                </div>
                <p className="text-green-100 leading-relaxed">{profile.vision || 'Menjadi mushola yang menjadi pusat peradaban Islam yang rahmatan lil alamin, membawa kebaikan bagi seluruh umat manusia.'}</p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center mr-3 text-xl text-white">🎯</div>
                  <h3 className="font-serif-custom text-2xl font-bold text-green-900">Misi</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{profile.mission || 'Membangun generasi Qurani yang berakhlak mulia, cerdas, dan bermanfaat bagi umat dan bangsa.'}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <h3 className="font-serif-custom text-2xl font-bold text-green-900 mb-6">Informasi Kontak</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: '📍', label: 'Alamat', value: profile.address || 'Jakarta, Indonesia' },
                  { icon: '📞', label: 'Telepon', value: profile.phone || '+62 21 1234567' },
                  { icon: '📧', label: 'Email', value: profile.email || 'info@masjid.id' },
                ].map(item => (
                  <div key={item.label} className="flex items-start space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-sm text-green-600 font-medium">{item.label}</p>
                      <p className="text-green-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
