'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function GalleryPage() {
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    fetch('/api/gallery').then(r => r.json()).then(d => {
      if (d.success) setGallery(d.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const categories = ['all', ...new Set(gallery.map(g => g.category).filter(Boolean))]
  
  const filtered = activeCategory === 'all' ? gallery : gallery.filter(g => g.category === activeCategory)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="relative pt-16 h-64 islamic-pattern flex items-center justify-center">
        <div className="text-center text-white">
          <p className="font-arabic text-3xl text-yellow-300 mb-2">معرض الصور</p>
          <h1 className="font-serif-custom text-4xl font-bold">Galeri Kegiatan</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                  activeCategory === cat
                    ? 'bg-green-700 text-white shadow-md'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                }`}>
                {cat === 'all' ? 'Semua' : cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🖼️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Foto</h3>
            <p className="text-gray-400">Foto kegiatan masjid akan segera ditambahkan</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map(item => (
              <div key={item.id} className="break-inside-avoid cursor-pointer group" onClick={() => setLightboxImage(item)}>
                <div className="rounded-xl overflow-hidden shadow-md relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      {item.category && <p className="text-green-300 text-xs capitalize">{item.category}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-yellow-300 text-3xl">✕</button>
          <div onClick={e => e.stopPropagation()} className="max-w-4xl w-full">
            <img src={lightboxImage.imageUrl} alt={lightboxImage.title} className="w-full rounded-xl shadow-2xl max-h-[80vh] object-contain" />
            <div className="mt-4 text-center">
              <p className="text-white font-semibold text-lg">{lightboxImage.title}</p>
              {lightboxImage.description && <p className="text-gray-300 mt-1">{lightboxImage.description}</p>}
              {lightboxImage.category && <p className="text-green-400 text-sm capitalize mt-1">{lightboxImage.category}</p>}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
