'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

// --- Reusable Modal ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-green-100">
          <h3 className="font-bold text-green-900 text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// --- Image Upload Component ---
const ImageUpload = ({ value, onChange, token }) => {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target.result
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ imageData: base64, filename: file.name })
        })
        const data = await res.json()
        if (data.success) {
          onChange(data.imageUrl)
          toast.success('Gambar berhasil diupload!')
        } else {
          toast.error('Upload gagal: ' + data.error)
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      toast.error('Upload gagal')
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div
        className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-green-600 text-sm">Mengupload...</p>
          </div>
        ) : value ? (
          <div>
            <img src={value} alt="Preview" className="max-h-32 mx-auto rounded-lg object-contain mb-2" />
            <p className="text-xs text-green-600">Klik untuk mengganti gambar</p>
          </div>
        ) : (
          <div>
            <svg className="w-10 h-10 text-green-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-green-600 text-sm font-medium">Klik atau drag & drop gambar</p>
            <p className="text-green-400 text-xs mt-1">JPG, PNG, GIF (maks. 5MB)</p>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
      <div className="flex items-center">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-2 text-xs text-gray-400">atau URL gambar</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>
      <input
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://..."
        className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)

  // Data states
  const [profile, setProfile] = useState({})
  const [schedule, setSchedule] = useState({})
  const [gallery, setGallery] = useState([])
  const [events, setEvents] = useState([])
  const [social, setSocial] = useState({})

  // Modal states
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingGallery, setEditingGallery] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)

  // Form states
  const [galleryForm, setGalleryForm] = useState({ title: '', imageUrl: '', description: '', category: '' })
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', type: 'event', location: '', imageUrl: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const t = localStorage.getItem('mosque_admin_token')
    if (!t) { router.push('/admin'); return }
    setToken(t)
    loadAllData(t)
  }, [])

  const loadAllData = async (t) => {
    try {
      const headers = { 'Authorization': `Bearer ${t}` }
      const [profRes, schedRes, galRes, evtRes, socRes] = await Promise.all([
        fetch('/api/mosque-profile'),
        fetch('/api/prayer-schedule'),
        fetch('/api/gallery'),
        fetch('/api/events'),
        fetch('/api/social-media')
      ])
      const [profData, schedData, galData, evtData, socData] = await Promise.all([
        profRes.json(), schedRes.json(), galRes.json(), evtRes.json(), socRes.json()
      ])
      if (profData.success) setProfile(profData.data || {})
      if (schedData.success) setSchedule(schedData.data || {})
      if (galData.success) setGallery(galData.data || [])
      if (evtData.success) setEvents(evtData.data || [])
      if (socData.success) setSocial(socData.data || {})
    } catch (err) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const authFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
      }
    })
  }

  const handleLogout = async () => {
    await authFetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('mosque_admin_token')
    router.push('/admin')
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await authFetch('/api/mosque-profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      })
      const data = await res.json()
      if (data.success) { setProfile(data.data); toast.success('Profil berhasil disimpan!') }
      else toast.error(data.error)
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const saveSchedule = async () => {
    setSaving(true)
    try {
      const res = await authFetch('/api/prayer-schedule', {
        method: 'PUT',
        body: JSON.stringify(schedule)
      })
      const data = await res.json()
      if (data.success) { setSchedule(data.data); toast.success('Jadwal berhasil disimpan!') }
      else toast.error(data.error)
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const saveSocial = async () => {
    setSaving(true)
    try {
      const res = await authFetch('/api/social-media', {
        method: 'PUT',
        body: JSON.stringify(social)
      })
      const data = await res.json()
      if (data.success) { setSocial(data.data); toast.success('Media sosial berhasil disimpan!') }
      else toast.error(data.error)
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const openGalleryModal = (item = null) => {
    if (item) {
      setEditingGallery(item)
      setGalleryForm({ title: item.title, imageUrl: item.imageUrl, description: item.description || '', category: item.category || '' })
    } else {
      setEditingGallery(null)
      setGalleryForm({ title: '', imageUrl: '', description: '', category: '' })
    }
    setShowGalleryModal(true)
  }

  const saveGallery = async () => {
    if (!galleryForm.title || !galleryForm.imageUrl) { toast.error('Judul dan gambar wajib diisi'); return }
    setSaving(true)
    try {
      let res
      if (editingGallery) {
        res = await authFetch(`/api/gallery/${editingGallery.id}`, {
          method: 'PUT', body: JSON.stringify(galleryForm)
        })
      } else {
        res = await authFetch('/api/gallery', { method: 'POST', body: JSON.stringify(galleryForm) })
      }
      const data = await res.json()
      if (data.success) {
        loadAllData(token)
        setShowGalleryModal(false)
        toast.success(editingGallery ? 'Foto berhasil diperbarui!' : 'Foto berhasil ditambahkan!')
      } else toast.error(data.error)
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const deleteGallery = async (id) => {
    if (!confirm('Yakin hapus foto ini?')) return
    try {
      const res = await authFetch(`/api/gallery/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { loadAllData(token); toast.success('Foto dihapus!') }
      else toast.error(data.error)
    } catch { toast.error('Gagal menghapus') }
  }

  const openEventModal = (item = null) => {
    if (item) {
      setEditingEvent(item)
      setEventForm({
        title: item.title, description: item.description || '',
        date: item.date ? item.date.split('T')[0] : '',
        type: item.type || 'event', location: item.location || '', imageUrl: item.imageUrl || ''
      })
    } else {
      setEditingEvent(null)
      setEventForm({ title: '', description: '', date: '', type: 'event', location: '', imageUrl: '' })
    }
    setShowEventModal(true)
  }

  const saveEvent = async () => {
    if (!eventForm.title) { toast.error('Judul wajib diisi'); return }
    setSaving(true)
    try {
      let res
      if (editingEvent) {
        res = await authFetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT', body: JSON.stringify(eventForm)
        })
      } else {
        res = await authFetch('/api/events', { method: 'POST', body: JSON.stringify(eventForm) })
      }
      const data = await res.json()
      if (data.success) {
        loadAllData(token)
        setShowEventModal(false)
        toast.success(editingEvent ? 'Berhasil diperbarui!' : 'Berhasil ditambahkan!')
      } else toast.error(data.error)
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const deleteEvent = async (id) => {
    if (!confirm('Yakin hapus acara ini?')) return
    try {
      const res = await authFetch(`/api/events/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { loadAllData(token); toast.success('Acara dihapus!') }
      else toast.error(data.error)
    } catch { toast.error('Gagal menghapus') }
  }

  const TABS = [
    { id: 'profile', label: 'Profil Masjid', icon: '🏛️' },
    { id: 'prayer', label: 'Jadwal Sholat', icon: '🕒' },
    { id: 'gallery', label: 'Galeri', icon: '🖼️' },
    { id: 'events', label: 'Berita & Acara', icon: '📰' },
    { id: 'social', label: 'Media Sosial', icon: '📱' },
  ]

  const InputField = ({ label, value, onChange, type = 'text', placeholder = '', required = false }) => (
    <div>
      <label className="block text-sm font-medium text-green-800 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
    </div>
  )

  const TextArea = ({ label, value, onChange, rows = 4, placeholder = '' }) => (
    <div>
      <label className="block text-sm font-medium text-green-800 mb-1">{label}</label>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen islamic-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-semibold">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-green-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
              <path d="M20 2 C20 2, 8 12, 8 22 C8 28 13 34 20 34 C27 34 32 28 32 22 C32 12 20 2 20 2Z" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm">Admin Dashboard</p>
            <p className="text-green-300 text-xs">Mushola Al-Iman</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" target="_blank" className="text-green-300 hover:text-white text-sm flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            <span>Lihat Website</span>
          </Link>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
            Keluar
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-60 bg-white border-r border-green-100 min-h-screen pt-6 shadow-sm">
          <nav className="px-3">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl mb-1 text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-green-700 text-white shadow-md'
                    : 'text-green-800 hover:bg-green-50'
                }`}>
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-green-900 mb-6">Profil Masjid</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Nama Masjid" value={profile.name} onChange={v => setProfile({...profile, name: v})} required />
                  <InputField label="Nama Arab" value={profile.arabicName} onChange={v => setProfile({...profile, arabicName: v})} placeholder="مسجد" />
                </div>
                <TextArea label="Deskripsi" value={profile.description} onChange={v => setProfile({...profile, description: v})} rows={4} placeholder="Deskripsi masjid..." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Tahun Berdiri" value={profile.yearEstablished} onChange={v => setProfile({...profile, yearEstablished: v})} placeholder="2025" />
                  <InputField label="Kapasitas Jamaah" value={profile.capacity} onChange={v => setProfile({...profile, capacity: v})} placeholder="100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Nama Imam" value={profile.imamName} onChange={v => setProfile({...profile, imamName: v})} placeholder="Ustadz..." />
                  <InputField label="Nama Khatib Jumat" value={profile.khatibName} onChange={v => setProfile({...profile, khatibName: v})} placeholder="Ustadz..." />
                </div>
                <InputField label="Alamat" value={profile.address} onChange={v => setProfile({...profile, address: v})} placeholder="Jl. ..." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Telepon" value={profile.phone} onChange={v => setProfile({...profile, phone: v})} type="tel" />
                  <InputField label="Email" value={profile.email} onChange={v => setProfile({...profile, email: v})} type="email" />
                </div>
                <TextArea label="Visi" value={profile.vision} onChange={v => setProfile({...profile, vision: v})} rows={3} />
                <TextArea label="Misi" value={profile.mission} onChange={v => setProfile({...profile, mission: v})} rows={3} />
                <button onClick={saveProfile} disabled={saving}
                  className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>
            </div>
          )}

          {/* PRAYER SCHEDULE TAB */}
          {activeTab === 'prayer' && (
            <div className="max-w-lg">
              <h2 className="text-2xl font-bold text-green-900 mb-6">Jadwal Waktu Sholat</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 space-y-4">
                {[
                  { key: 'fajr', label: 'Subuh (Imsak/Azan)' },
                  { key: 'subuhJamaah', label: 'Subuh (Jamaah)' },
                  { key: 'dhuhr', label: 'Dzuhur (Azan)' },
                  { key: 'dzuhurJamaah', label: 'Dzuhur (Jamaah)' },
                  { key: 'asr', label: 'Ashar (Azan)' },
                  { key: 'asrJamaah', label: 'Ashar (Jamaah)' },
                  { key: 'maghrib', label: 'Maghrib (Azan)' },
                  { key: 'maghribJamaah', label: 'Maghrib (Jamaah)' },
                  { key: 'isha', label: 'Isya (Azan)' },
                  { key: 'isyaJamaah', label: 'Isya (Jamaah)' },
                  { key: 'jumuah', label: 'Jumat' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-green-800 w-48">{item.label}</label>
                    <input type="time" value={schedule[item.key] || ''} onChange={e => setSchedule({...schedule, [item.key]: e.target.value})}
                      className="px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                  </div>
                ))}
                <button onClick={saveSchedule} disabled={saving}
                  className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-all">
                  {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-900">Galeri Foto</h2>
                <button onClick={() => openGalleryModal()}
                  className="flex items-center space-x-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl transition-all text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span>Tambah Foto</span>
                </button>
              </div>
              {gallery.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-green-100">
                  <div className="text-5xl mb-3">🖼️</div>
                  <p className="text-gray-500">Belum ada foto. Tambahkan foto pertama!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gallery.map(item => (
                    <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-green-100 group">
                      <div className="aspect-square relative overflow-hidden">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <button onClick={() => openGalleryModal(item)} className="p-2 bg-white rounded-full text-green-700 hover:text-green-900">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => deleteGallery(item.id)} className="p-2 bg-white rounded-full text-red-600 hover:text-red-800">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-green-900 truncate">{item.title}</p>
                        {item.category && <p className="text-xs text-green-500 capitalize">{item.category}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-900">Berita & Acara</h2>
                <button onClick={() => openEventModal()}
                  className="flex items-center space-x-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl transition-all text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span>Tambah Berita/Acara</span>
                </button>
              </div>
              {events.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-green-100">
                  <div className="text-5xl mb-3">📰</div>
                  <p className="text-gray-500">Belum ada berita. Tambahkan yang pertama!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map(item => (
                    <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-green-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">{item.type === 'news' ? '📰' : '📅'}</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-green-900 truncate">{item.title}</p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${ item.type === 'news' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700' }`}>
                              {item.type === 'news' ? 'Berita' : 'Acara'}
                            </span>
                            {item.date && <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString('id-ID')}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                        <button onClick={() => openEventModal(item)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => deleteEvent(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SOCIAL MEDIA TAB */}
          {activeTab === 'social' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-green-900 mb-6">Media Sosial</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 space-y-4">
                {[
                  { key: 'youtube', label: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/@...' },
                  { key: 'youtubeVideoId', label: 'YouTube Video ID (untuk embed di homepage)', icon: '🎥', placeholder: 'Contoh: dQw4w9WgXcQ' },
                  { key: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'https://instagram.com/...' },
                  { key: 'tiktok', label: 'TikTok', icon: '💡', placeholder: 'https://tiktok.com/@...' },
                  { key: 'facebook', label: 'Facebook', icon: '📖', placeholder: 'https://facebook.com/...' },
                ].map(item => (
                  <div key={item.key}>
                    <label className="block text-sm font-medium text-green-800 mb-1">
                      <span className="mr-2">{item.icon}</span>{item.label}
                    </label>
                    <input type="text" value={social[item.key] || ''} onChange={e => setSocial({...social, [item.key]: e.target.value})}
                      placeholder={item.placeholder}
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                  </div>
                ))}
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    💡 <strong>Tip:</strong> YouTube Video ID adalah bagian dari URL setelah <code>v=</code>. Contoh: youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>
                  </p>
                </div>
                <button onClick={saveSocial} disabled={saving}
                  className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-all">
                  {saving ? 'Menyimpan...' : 'Simpan Media Sosial'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Modal */}
      <Modal isOpen={showGalleryModal} onClose={() => setShowGalleryModal(false)} title={editingGallery ? 'Edit Foto' : 'Tambah Foto Baru'}>
        <div className="space-y-4">
          <InputField label="Judul Foto" value={galleryForm.title} onChange={v => setGalleryForm({...galleryForm, title: v})} required placeholder="Judul foto..." />
          <InputField label="Kategori" value={galleryForm.category} onChange={v => setGalleryForm({...galleryForm, category: v})} placeholder="Kegiatan, Arsitektur, dll" />
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Gambar <span className="text-red-500">*</span></label>
            <ImageUpload value={galleryForm.imageUrl} onChange={v => setGalleryForm({...galleryForm, imageUrl: v})} token={token} />
          </div>
          <InputField label="Deskripsi" value={galleryForm.description} onChange={v => setGalleryForm({...galleryForm, description: v})} placeholder="Deskripsi foto..." />
          <div className="flex space-x-3">
            <button onClick={() => setShowGalleryModal(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">Batal</button>
            <button onClick={saveGallery} disabled={saving} className="flex-1 py-2 bg-green-700 text-white rounded-xl hover:bg-green-800 disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Event Modal */}
      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title={editingEvent ? 'Edit Berita/Acara' : 'Tambah Berita/Acara'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Tipe</label>
            <div className="flex gap-3">
              {[{v:'event',l:'📅 Acara'},{v:'news',l:'📰 Berita'}].map(opt => (
                <label key={opt.v} className={`flex-1 flex items-center justify-center py-2 border-2 rounded-xl cursor-pointer transition-all ${
                  eventForm.type === opt.v ? 'border-green-600 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600'
                }`}>
                  <input type="radio" value={opt.v} checked={eventForm.type === opt.v} onChange={e => setEventForm({...eventForm, type: e.target.value})} className="hidden" />
                  {opt.l}
                </label>
              ))}
            </div>
          </div>
          <InputField label="Judul" value={eventForm.title} onChange={v => setEventForm({...eventForm, title: v})} required />
          <TextArea label="Deskripsi" value={eventForm.description} onChange={v => setEventForm({...eventForm, description: v})} rows={4} />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Tanggal" value={eventForm.date} onChange={v => setEventForm({...eventForm, date: v})} type="date" />
            <InputField label="Lokasi" value={eventForm.location} onChange={v => setEventForm({...eventForm, location: v})} placeholder="Aula masjid..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Gambar (opsional)</label>
            <ImageUpload value={eventForm.imageUrl} onChange={v => setEventForm({...eventForm, imageUrl: v})} token={token} />
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setShowEventModal(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">Batal</button>
            <button onClick={saveEvent} disabled={saving} className="flex-1 py-2 bg-green-700 text-white rounded-xl hover:bg-green-800 disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
