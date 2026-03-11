'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const PrayerCard = ({ name, arabicName, time, jamaahTime, icon }) => (
  <div className="prayer-card rounded-xl p-4 text-white text-center shadow-lg card-hover">
    <div className="text-3xl mb-1">{icon}</div>
    <p className="font-arabic text-yellow-300 text-sm mb-0.5">{arabicName}</p>
    <p className="font-semibold text-sm">{name}</p>
    <p className="text-2xl font-bold text-yellow-300 my-1">{time || '--:--'}</p>
    {jamaahTime && <p className="text-xs text-green-200">Jamaah: {jamaahTime}</p>}
  </div>
)

const EventCard = ({ event }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover border border-green-100">
    {event.imageUrl && (
      <div className="h-44 overflow-hidden">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          event.type === 'news' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        }`}>
          {event.type === 'news' ? 'Berita' : 'Acara'}
        </span>
        {event.date && <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
      </div>
      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{event.title}</h3>
      {event.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>}
    </div>
  </div>
)

const GalleryCard = ({ item }) => (
  <div className="aspect-square rounded-xl overflow-hidden shadow-md card-hover relative group">
    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
      <p className="text-white text-sm font-medium">{item.title}</p>
    </div>
  </div>
)

export default function HomePage() {
  const [profile, setProfile] = useState({})
  const [schedule, setSchedule] = useState({})
  const [events, setEvents] = useState([])
  const [gallery, setGallery] = useState([])
  const [socialMedia, setSocialMedia] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, scheduleRes, eventsRes, galleryRes, socialRes] = await Promise.all([
          fetch('/api/mosque-profile'),
          fetch('/api/prayer-schedule'),
          fetch('/api/events'),
          fetch('/api/gallery'),
          fetch('/api/social-media')
        ])
        const [profileData, scheduleData, eventsData, galleryData, socialData] = await Promise.all([
          profileRes.json(), scheduleRes.json(), eventsRes.json(), galleryRes.json(), socialRes.json()
        ])
        if (profileData.success) setProfile(profileData.data || {})
        if (scheduleData.success) setSchedule(scheduleData.data || {})
        if (eventsData.success) setEvents(eventsData.data || [])
        if (galleryData.success) setGallery(galleryData.data || [])
        if (socialData.success) setSocialMedia(socialData.data || {})
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getYouTubeEmbedId = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtu\.be\/|youtube\.com.*v=|youtube\.com.*\/)([-\w]+)/)
    return match?.[1] || null
  }

  const videoId = socialMedia.youtubeVideoId || getYouTubeEmbedId(socialMedia.youtube)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1600&q=80')` }}
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0l20 20-20 20 20 20-20 20h20l20-20-20-20 20-20-20-20h-20zm40 0l20 20-20 20 20 20-20 20h20l20-20-20-20 20-20-20-20h-20z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }} />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="font-arabic text-3xl md:text-4xl text-yellow-300 mb-4 animate-fade-in-up">بسم الله الرحمن الرحيم</p>
          <p className="font-arabic text-5xl md:text-7xl text-white mb-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            {profile.arabicName || 'مصلى الإيمان'}
          </p>
          <h1 className="font-serif-custom text-3xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            {profile.name || 'Mushola Al-Iman'}
          </h1>
          <p className="text-green-200 text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            {profile.description?.substring(0, 120) || 'Pusat kegiatan Islam yang menjadi rahmat bagi seluruh ummat'}...
          </p>
          
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-yellow-300 font-mono text-xl font-bold">{currentTime}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <Link href="/prayer-schedule" className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
              Jadwal Sholat
            </Link>
            <Link href="/about" className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full border border-white/40 transition-all duration-200 backdrop-blur-sm">
              Tentang Kami
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Prayer Times Section */}
      <section className="py-16 px-4 islamic-pattern">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-arabic text-yellow-300 text-2xl mb-1">أوقات الصلاة</p>
            <h2 className="font-serif-custom text-3xl font-bold text-white">Jadwal Waktu Sholat</h2>
            <p className="text-green-200 mt-2">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <PrayerCard name="Subuh" arabicName="فجر" time={schedule.fajr} jamaahTime={schedule.subuhJamaah} icon="🌅" />
            <PrayerCard name="Dzuhur" arabicName="ظهر" time={schedule.dhuhr} jamaahTime={schedule.dzuhurJamaah} icon="☀️" />
            <PrayerCard name="Ashar" arabicName="عصر" time={schedule.asr} jamaahTime={schedule.asrJamaah} icon="🌄" />
            <PrayerCard name="Maghrib" arabicName="مغرب" time={schedule.maghrib} jamaahTime={schedule.maghribJamaah} icon="🌇" />
            <PrayerCard name="Isya" arabicName="عشاء" time={schedule.isha} jamaahTime={schedule.isyaJamaah} icon="🌙" />
          </div>

          <div className="text-center mt-8">
            <Link href="/prayer-schedule" className="inline-flex items-center px-6 py-3 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-400 transition-all duration-200 hover:scale-105">
              Lihat Jadwal Lengkap
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-arabic text-green-700 text-xl mb-2">تعرف على مصلانا</p>
              <h2 className="font-serif-custom text-3xl md:text-4xl font-bold text-green-900 mb-4">
                Tentang Mushola {profile.name?.replace('Mushola ', '') || 'Al-Iman'}
              </h2>
              <hr className="section-divider mb-6" />
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                {profile.description || 'Mushola Al-Iman adalah tempat ibadah yang berkomitmen untuk menjadi pusat kegiatan Islam yang membawa rahmat bagi seluruh masyarakat.'}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Didirikan', value: profile.yearEstablished || '1975', icon: '🏛️' },
                  { label: 'Kapasitas', value: `${profile.capacity || '1000'} Jamaah`, icon: '👥' },
                  { label: 'Imam', value: profile.imamName?.split(',')[0] || 'Ustadz Ahmad', icon: '📝' },
                  { label: 'Lokasi', value: profile.address?.split(',')[0] || 'Jakarta', icon: '📍' },
                ].map(item => (
                  <div key={item.label} className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="text-xs text-green-600 font-medium">{item.label}</p>
                    <p className="text-sm font-semibold text-green-800 truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              <Link href="/about" className="inline-flex items-center px-6 py-3 bg-green-700 text-white font-semibold rounded-full hover:bg-green-800 transition-all duration-200 hover:scale-105 shadow-md">
                Selengkapnya
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1535117423468-de0ff056882e?w=800&q=80"
                  alt="Masjid"
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-400 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{new Date().getFullYear() - parseInt(profile.yearEstablished || '1975')}+</p>
                <p className="text-xs text-green-600">Tahun Berdiri</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Video Section */}
      {videoId && (
        <section className="py-16 px-4 bg-green-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif-custom text-3xl font-bold text-green-900">Video Terbaru</h2>
              <p className="text-green-600 mt-2">Tonton ceramah dan kegiatan masjid kami</p>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Video Masjid"
              />
            </div>
          </div>
        </section>
      )}

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="font-arabic text-green-700 text-xl mb-1">معرض الصور</p>
              <h2 className="font-serif-custom text-3xl font-bold text-green-900">Galeri Kegiatan</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.slice(0, 8).map(item => (
                <GalleryCard key={item.id} item={item} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/gallery" className="inline-flex items-center px-6 py-3 border-2 border-green-700 text-green-700 font-semibold rounded-full hover:bg-green-700 hover:text-white transition-all duration-200">
                Lihat Semua Foto
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Events Preview */}
      {events.length > 0 && (
        <section className="py-16 px-4 bg-green-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="font-arabic text-green-700 text-xl mb-1">الأخبار والفعاليات</p>
              <h2 className="font-serif-custom text-3xl font-bold text-green-900">Berita & Acara</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 3).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/events" className="inline-flex items-center px-6 py-3 border-2 border-green-700 text-green-700 font-semibold rounded-full hover:bg-green-700 hover:text-white transition-all duration-200">
                Lihat Semua Berita
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Social Media Section */}
      <section className="py-16 px-4 islamic-pattern">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-arabic text-yellow-300 text-2xl mb-2">تواصل معنا</p>
          <h2 className="font-serif-custom text-3xl font-bold text-white mb-4">Ikuti Kami di Media Sosial</h2>
          <p className="text-green-200 mb-8">Dapatkan update terbaru kegiatan masjid dan ceramah inspiratif</p>
          <div className="flex justify-center flex-wrap gap-4">
            {socialMedia.youtube && (
              <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                <span className="font-semibold">YouTube</span>
              </a>
            )}
            {socialMedia.instagram && (
              <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                <span className="font-semibold">Instagram</span>
              </a>
            )}
            {socialMedia.tiktok && (
              <a href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.68a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" /></svg>
                <span className="font-semibold">TikTok</span>
              </a>
            )}
            {socialMedia.facebook && (
              <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                <span className="font-semibold">Facebook</span>
              </a>
            )}
            {!socialMedia.youtube && !socialMedia.instagram && !socialMedia.tiktok && !socialMedia.facebook && (
              <p className="text-green-200 text-sm">Media sosial belum dikonfigurasi. <Link href="/admin" className="text-yellow-400 underline">Admin dapat mengatur di sini</Link></p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
