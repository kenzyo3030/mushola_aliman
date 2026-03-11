'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [profile, setProfile] = useState({})
  const [socialMedia, setSocialMedia] = useState({})
  const [schedule, setSchedule] = useState({})
  const [currentYear, setCurrentYear] = useState(2024)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
    fetch('/api/mosque-profile').then(r => r.json()).then(d => { if (d.success) setProfile(d.data || {}) }).catch(() => {})
    fetch('/api/social-media').then(r => r.json()).then(d => { if (d.success) setSocialMedia(d.data || {}) }).catch(() => {})
    fetch('/api/prayer-schedule').then(r => r.json()).then(d => { if (d.success) setSchedule(d.data || {}) }).catch(() => {})
  }, [])

  return (
    <footer className="bg-green-900 text-green-100">
      {/* Islamic pattern divider */}
      <div className="islamic-pattern h-8 opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Mosque Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
                  <path d="M20 2 C20 2, 8 12, 8 22 C8 28 13 34 20 34 C27 34 32 28 32 22 C32 12 20 2 20 2Z" fill="white" opacity="0.9"/>
                  <circle cx="20" cy="3" r="2" fill="white"/>
                </svg>
              </div>
              <p className="font-bold text-white">{profile.name || 'Mushola Al-Iman'}</p>
            </div>
            <p className="font-arabic text-yellow-400 text-xl mb-2">{profile.arabicName || 'مصلى الإيمان'}</p>
            <p className="text-sm text-green-300 leading-relaxed">{profile.address || 'Jakarta, Indonesia'}</p>
            <p className="text-sm text-green-300 mt-1">{profile.phone}</p>
            <p className="text-sm text-green-300">{profile.email}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Navigasi</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Beranda' },
                { href: '/about', label: 'Tentang Mushola' },
                { href: '/prayer-schedule', label: 'Jadwal Sholat' },
                { href: '/gallery', label: 'Galeri' },
                { href: '/events', label: 'Berita & Acara' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-green-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                    <span className="text-yellow-500">›</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Prayer Times */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Waktu Sholat</h3>
            <ul className="space-y-2">
              {[
                { name: 'Subuh', time: schedule.fajr },
                { name: 'Dzuhur', time: schedule.dhuhr },
                { name: 'Ashar', time: schedule.asr },
                { name: 'Maghrib', time: schedule.maghrib },
                { name: 'Isya', time: schedule.isha },
              ].map(item => (
                <li key={item.name} className="flex justify-between">
                  <span className="text-sm text-green-300">{item.name}</span>
                  <span className="text-sm font-medium text-yellow-400">{item.time || '--:--'}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Media Sosial</h3>
            <div className="flex flex-wrap gap-3">
              {socialMedia.youtube && (
                <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-green-300 hover:text-red-400 transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                  <span className="text-sm">YouTube</span>
                </a>
              )}
              {socialMedia.instagram && (
                <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-green-300 hover:text-pink-400 transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  <span className="text-sm">Instagram</span>
                </a>
              )}
              {socialMedia.tiktok && (
                <a href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-green-300 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.68a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" /></svg>
                  <span className="text-sm">TikTok</span>
                </a>
              )}
              {socialMedia.facebook && (
                <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-green-300 hover:text-blue-400 transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  <span className="text-sm">Facebook</span>
                </a>
              )}
            </div>
            <div className="mt-6 p-3 bg-green-800 rounded-lg">
              <p className="text-yellow-400 font-arabic text-lg text-center">بسم الله الرحمن الرحيم</p>
              <p className="text-green-300 text-xs text-center mt-1">Bismillahirrahmanirrahim</p>
            </div>
          </div>
        </div>

        <hr className="section-divider my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-green-400">
            &copy; {currentYear} {profile.name || 'Mushola Al-Iman'}. Semua hak dilindungi.
          </p>
          <p className="text-sm text-green-400 mt-2 md:mt-0">
            Dibangun dengan <span className="text-red-400">♥</span> untuk ummat Islam
          </p>
        </div>
      </div>
    </footer>
  )
}
