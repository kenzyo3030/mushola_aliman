'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

// ─── Modal ────────────────────────────────────────────────────────────────────
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

// ─── Image Upload ─────────────────────────────────────────────────────────────
const ImageUpload = ({ value, onChange, getToken }) => {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran file maksimal 5MB'); return }
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target.result
        const token = getToken()
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ imageData: base64, filename: file.name })
        })
        const data = await res.json()
        if (data.success) { onChange(data.imageUrl); toast.success('Gambar berhasil diupload!') }
        else toast.error('Upload gagal: ' + data.error)
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch { toast.error('Upload gagal'); setUploading(false) }
  }

  return (
    <div className="space-y-2">
      <div
        className="border-2 border-dashed border-green-300 rounded-xl p-5 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mb-2"></div>
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
      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="text-xs text-gray-400">atau gunakan URL</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="https://contoh.com/gambar.jpg"
        className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )
}

// ─── Field Helpers ────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-green-800 mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
)

const Input = ({ value, onChange, type = 'text', placeholder = '' }) => (
  <input
    type={type}
    value={value ?? ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
  />
)

const Textarea = ({ value, onChange, rows = 3, placeholder = '' }) => (
  <textarea
    value={value ?? ''}
    onChange={e => onChange(e.target.value)}
    rows={rows}
    placeholder={placeholder}
    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none bg-white"
  />
)

// ─── Save Button ──────────────────────────────────────────────────────────────
const SaveBtn = ({ onClick, saving, label = 'Simpan Perubahan' }) => (
  <button
    onClick={onClick}
    disabled={saving}
    className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
  >
    {saving ? (
      <>
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span>Menyimpan...</span>
      </>
    ) : (
      <>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>{label}</span>
      </>
    )}
  </button>
)

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  const tokenRef = useRef('')                 // ← always-current token via ref
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ── Data states ──
  const [profile, setProfile] = useState({})
  const [schedule, setSchedule] = useState({})
  const [gallery, setGallery] = useState([])
  const [events, setEvents] = useState([])
  const [social, setSocial] = useState({})

  // ── Modal states ──
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [showEventModal, setShowEventModal]     = useState(false)
  const [editingGallery, setEditingGallery]     = useState(null)
  const [editingEvent, setEditingEvent]         = useState(null)
  const [galleryForm, setGalleryForm]           = useState({ title: '', imageUrl: '', description: '', category: '' })
  const [eventForm, setEventForm]               = useState({ title: '', description: '', date: '', type: 'event', location: '', imageUrl: '' })

  // ── Get token (always fresh via ref) ──
  const getToken = useCallback(() => tokenRef.current, [])

  // ── Auth fetch using ref token (no stale closure) ──
  const authFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenRef.current}`,
        ...(options.headers || {})
      }
    })
  }, [])

  // ── Load all data ──
  const loadAllData = useCallback(async () => {
    try {
      const [p, s, g, e, sm] = await Promise.all([
        fetch('/api/mosque-profile').then(r => r.json()),
        fetch('/api/prayer-schedule').then(r => r.json()),
        fetch('/api/gallery').then(r => r.json()),
        fetch('/api/events').then(r => r.json()),
        fetch('/api/social-media').then(r => r.json()),
      ])
      if (p.success  && p.data)  setProfile(p.data)
      if (s.success  && s.data)  setSchedule(s.data)
      if (g.success)              setGallery(g.data  || [])
      if (e.success)              setEvents(e.data   || [])
      if (sm.success && sm.data) setSocial(sm.data)
    } catch {
      toast.error('Gagal memuat data dari server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = localStorage.getItem('mosque_admin_token')
    if (!t) { router.push('/admin'); return }
    tokenRef.current = t          // set ref immediately (no render delay)
    loadAllData()
  }, [loadAllData, router])

  const handleLogout = async () => {
    await authFetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('mosque_admin_token')
    router.push('/admin')
  }

  // ── Profile helpers ──
  const setP = (key) => (val) => setProfile(prev => ({ ...prev, [key]: val }))

  const saveProfile = async () => {
    if (!profile.name?.trim()) { toast.error('Nama mushola wajib diisi'); return }
    setSaving(true)
    try {
      const res  = await authFetch('/api/mosque-profile', { method: 'PUT', body: JSON.stringify(profile) })
      const data = await res.json()
      if (data.success) {
        setProfile(data.data)
        toast.success('✅ Profil mushola berhasil disimpan!')
      } else {
        toast.error('Gagal: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Schedule helpers ──
  const setS = (key) => (val) => setSchedule(prev => ({ ...prev, [key]: val }))

  const saveSchedule = async () => {
    setSaving(true)
    try {
      const res  = await authFetch('/api/prayer-schedule', { method: 'PUT', body: JSON.stringify(schedule) })
      const data = await res.json()
      if (data.success) { setSchedule(data.data); toast.success('✅ Jadwal berhasil disimpan!') }
      else toast.error('Gagal: ' + data.error)
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  // ── Social helpers ──
  const setSM = (key) => (val) => setSocial(prev => ({ ...prev, [key]: val }))

  const saveSocial = async () => {
    setSaving(true)
    try {
      const res  = await authFetch('/api/social-media', { method: 'PUT', body: JSON.stringify(social) })
      const data = await res.json()
      if (data.success) { setSocial(data.data); toast.success('✅ Media sosial berhasil disimpan!') }
      else toast.error('Gagal: ' + data.error)
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  // ── Gallery CRUD ──
  const openGalleryModal = (item = null) => {
    setEditingGallery(item)
    setGalleryForm(item
      ? { title: item.title || '', imageUrl: item.imageUrl || '', description: item.description || '', category: item.category || '' }
      : { title: '', imageUrl: '', description: '', category: '' }
    )
    setShowGalleryModal(true)
  }

  const saveGallery = async () => {
    if (!galleryForm.title?.trim()) { toast.error('Judul foto wajib diisi'); return }
    if (!galleryForm.imageUrl?.trim()) { toast.error('Gambar wajib diisi'); return }
    setSaving(true)
    try {
      const url    = editingGallery ? `/api/gallery/${editingGallery.id}` : '/api/gallery'
      const method = editingGallery ? 'PUT' : 'POST'
      const res    = await authFetch(url, { method, body: JSON.stringify(galleryForm) })
      const data   = await res.json()
      if (data.success) {
        setShowGalleryModal(false)
        await loadAllData()
        toast.success(editingGallery ? '✅ Foto diperbarui!' : '✅ Foto ditambahkan!')
      } else toast.error('Gagal: ' + data.error)
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const deleteGallery = async (id) => {
    if (!confirm('Yakin ingin menghapus foto ini?')) return
    try {
      const res  = await authFetch(`/api/gallery/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { await loadAllData(); toast.success('Foto dihapus!') }
      else toast.error(data.error)
    } catch { toast.error('Gagal menghapus') }
  }

  // ── Events CRUD ──
  const openEventModal = (item = null) => {
    setEditingEvent(item)
    setEventForm(item
      ? { title: item.title || '', description: item.description || '', date: item.date ? item.date.split('T')[0] : '', type: item.type || 'event', location: item.location || '', imageUrl: item.imageUrl || '' }
      : { title: '', description: '', date: '', type: 'event', location: '', imageUrl: '' }
    )
    setShowEventModal(true)
  }

  const saveEvent = async () => {
    if (!eventForm.title?.trim()) { toast.error('Judul wajib diisi'); return }
    setSaving(true)
    try {
      const url    = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'
      const res    = await authFetch(url, { method, body: JSON.stringify(eventForm) })
      const data   = await res.json()
      if (data.success) {
        setShowEventModal(false)
        await loadAllData()
        toast.success(editingEvent ? '✅ Diperbarui!' : '✅ Ditambahkan!')
      } else toast.error('Gagal: ' + data.error)
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const deleteEvent = async (id) => {
    if (!confirm('Yakin ingin menghapus acara ini?')) return
    try {
      const res  = await authFetch(`/api/events/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { await loadAllData(); toast.success('Acara dihapus!') }
      else toast.error(data.error)
    } catch { toast.error('Gagal menghapus') }
  }

  // ── Tabs ──
  const TABS = [
    { id: 'profile', label: 'Profil Mushola', icon: '🕌' },
    { id: 'prayer',  label: 'Jadwal Sholat',  icon: '🕐' },
    { id: 'gallery', label: 'Galeri',          icon: '🖼️' },
    { id: 'events',  label: 'Berita & Acara',  icon: '📰' },
    { id: 'social',  label: 'Media Sosial',    icon: '📱' },
  ]

  if (loading) return (
    <div className="min-h-screen islamic-pattern flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white font-semibold text-lg">Memuat dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Navbar ── */}
      <nav className="bg-green-800 text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center shadow">
            <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
              <path d="M20 2 C20 2, 8 12, 8 22 C8 28 13 34 20 34 C27 34 32 28 32 22 C32 12 20 2 20 2Z" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm">Admin Dashboard</p>
            <p className="text-green-300 text-xs">{profile.name || 'Mushola Al-Iman'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" target="_blank" className="text-green-300 hover:text-white text-sm flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="hidden sm:inline">Lihat Website</span>
          </Link>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-lg transition-colors font-medium">
            Keluar
          </button>
        </div>
      </nav>

      <div className="flex">

        {/* ── Sidebar ── */}
        <aside className="w-56 bg-white border-r border-green-100 min-h-[calc(100vh-65px)] pt-4 shadow-sm flex-shrink-0">
          <nav className="px-3 space-y-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 ${
                  activeTab === tab.id
                    ? 'bg-green-700 text-white shadow-md'
                    : 'text-green-800 hover:bg-green-50'
                }`}>
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 p-6 lg:p-8 min-w-0">

          {/* ══════════════ PROFIL TAB ══════════════ */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🕌</div>
                <div>
                  <h2 className="text-2xl font-bold text-green-900">Profil Mushola</h2>
                  <p className="text-sm text-green-600">Edit informasi lengkap mushola Anda</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-green-100 divide-y divide-green-50">

                {/* Identitas */}
                <div className="p-6">
                  <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-green-600 rounded-full inline-block"></span>
                    Identitas Mushola
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nama Mushola" required>
                      <Input value={profile.name} onChange={setP('name')} placeholder="Mushola Al-Iman" />
                    </Field>
                    <Field label="Nama dalam Bahasa Arab">
                      <Input value={profile.arabicName} onChange={setP('arabicName')} placeholder="مصلى الإيمان" />
                    </Field>
                    <Field label="Tahun Berdiri">
                      <Input value={profile.yearEstablished} onChange={setP('yearEstablished')} placeholder="1975" />
                    </Field>
                    <Field label="Kapasitas Jamaah">
                      <Input value={profile.capacity} onChange={setP('capacity')} placeholder="200" />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Deskripsi Mushola">
                      <Textarea value={profile.description} onChange={setP('description')} rows={4} placeholder="Ceritakan tentang mushola Anda..." />
                    </Field>
                  </div>
                </div>

                {/* Pengurus */}
                <div className="p-6">
                  <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-yellow-500 rounded-full inline-block"></span>
                    Pengurus & Takmir
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nama Imam">
                      <Input value={profile.imamName} onChange={setP('imamName')} placeholder="Ustadz Ahmad Fauzi, Lc." />
                    </Field>
                    <Field label="Nama Khatib Jumat">
                      <Input value={profile.khatibName} onChange={setP('khatibName')} placeholder="Ustadz Muhammad Ridwan" />
                    </Field>
                  </div>
                </div>

                {/* Kontak */}
                <div className="p-6">
                  <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-blue-500 rounded-full inline-block"></span>
                    Informasi Kontak
                  </h3>
                  <div className="space-y-4">
                    <Field label="Alamat Lengkap">
                      <Textarea value={profile.address} onChange={setP('address')} rows={2} placeholder="Jl. ..." />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Nomor Telepon">
                        <Input value={profile.phone} onChange={setP('phone')} type="tel" placeholder="+62 ..." />
                      </Field>
                      <Field label="Email">
                        <Input value={profile.email} onChange={setP('email')} type="email" placeholder="info@..." />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Visi & Misi */}
                <div className="p-6">
                  <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-purple-500 rounded-full inline-block"></span>
                    Visi & Misi
                  </h3>
                  <div className="space-y-4">
                    <Field label="Visi">
                      <Textarea value={profile.vision} onChange={setP('vision')} rows={3} placeholder="Visi mushola..." />
                    </Field>
                    <Field label="Misi">
                      <Textarea value={profile.mission} onChange={setP('mission')} rows={3} placeholder="Misi mushola..." />
                    </Field>
                  </div>
                </div>

                {/* Save */}
                <div className="p-6">
                  <SaveBtn onClick={saveProfile} saving={saving} label="Simpan Profil Mushola" />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ JADWAL SHOLAT TAB ══════════════ */}
          {activeTab === 'prayer' && (
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🕐</div>
                <div>
                  <h2 className="text-2xl font-bold text-green-900">Jadwal Waktu Sholat</h2>
                  <p className="text-sm text-green-600">Update jadwal azan & jamaah harian</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-green-100 divide-y divide-green-50">
                {[
                  { group: 'Subuh',   keys: [{ k: 'fajr',        l: 'Waktu Azan Subuh' }, { k: 'subuhJamaah',   l: 'Waktu Jamaah Subuh' }]   },
                  { group: 'Dzuhur',  keys: [{ k: 'dhuhr',       l: 'Waktu Azan Dzuhur' }, { k: 'dzuhurJamaah',  l: 'Waktu Jamaah Dzuhur' }]  },
                  { group: 'Ashar',   keys: [{ k: 'asr',         l: 'Waktu Azan Ashar' }, { k: 'asrJamaah',    l: 'Waktu Jamaah Ashar' }]   },
                  { group: 'Maghrib', keys: [{ k: 'maghrib',     l: 'Waktu Azan Maghrib' }, { k: 'maghribJamaah', l: 'Waktu Jamaah Maghrib' }] },
                  { group: 'Isya',    keys: [{ k: 'isha',        l: 'Waktu Azan Isya' }, { k: 'isyaJamaah',   l: 'Waktu Jamaah Isya' }]    },
                  { group: 'Jumat',   keys: [{ k: 'jumuah',      l: 'Waktu Sholat Jumat' }]                                                  },
                ].map(({ group, keys }) => (
                  <div key={group} className="p-5">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">{group}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {keys.map(({ k, l }) => (
                        <Field key={k} label={l}>
                          <input
                            type="time"
                            value={schedule[k] || ''}
                            onChange={e => setS(k)(e.target.value)}
                            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                          />
                        </Field>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="p-5">
                  <SaveBtn onClick={saveSchedule} saving={saving} label="Simpan Jadwal Sholat" />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ GALERI TAB ══════════════ */}
          {activeTab === 'gallery' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🖼️</div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-900">Galeri Foto</h2>
                    <p className="text-sm text-green-600">{gallery.length} foto tersimpan</p>
                  </div>
                </div>
                <button onClick={() => openGalleryModal()}
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl transition-all text-sm font-medium shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Foto
                </button>
              </div>

              {gallery.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-green-200">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p className="text-gray-500 font-medium">Belum ada foto</p>
                  <p className="text-gray-400 text-sm mt-1">Klik tombol "Tambah Foto" untuk mulai</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {gallery.map(item => (
                    <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-green-100 group">
                      <div className="aspect-square relative overflow-hidden bg-gray-100">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => openGalleryModal(item)} className="p-2 bg-white rounded-full text-green-700 hover:text-green-900 shadow">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => deleteGallery(item.id)} className="p-2 bg-white rounded-full text-red-600 hover:text-red-800 shadow">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-green-900 truncate">{item.title}</p>
                        {item.category && <span className="text-xs text-green-500 capitalize bg-green-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">{item.category}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ EVENTS TAB ══════════════ */}
          {activeTab === 'events' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">📰</div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-900">Berita & Acara</h2>
                    <p className="text-sm text-green-600">{events.length} item tersimpan</p>
                  </div>
                </div>
                <button onClick={() => openEventModal()}
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl transition-all text-sm font-medium shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Berita/Acara
                </button>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-green-200">
                  <div className="text-6xl mb-4">📰</div>
                  <p className="text-gray-500 font-medium">Belum ada berita atau acara</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map(item => (
                    <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-green-100 flex items-center gap-4">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">{item.type === 'news' ? '📰' : '📅'}</div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-green-900 truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.type === 'news' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {item.type === 'news' ? 'Berita' : 'Acara'}
                          </span>
                          {item.date && <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          {item.location && <span className="text-xs text-gray-400">📍 {item.location}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => openEventModal(item)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => deleteEvent(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ SOSIAL MEDIA TAB ══════════════ */}
          {activeTab === 'social' && (
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">📱</div>
                <div>
                  <h2 className="text-2xl font-bold text-green-900">Media Sosial</h2>
                  <p className="text-sm text-green-600">Kelola link media sosial mushola</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-green-100 divide-y divide-green-50">
                <div className="p-6 space-y-4">
                  {[
                    { key: 'youtube',       label: 'YouTube Channel',       icon: '📺', color: 'text-red-600',   placeholder: 'https://youtube.com/@namakanal' },
                    { key: 'youtubeVideoId',label: 'YouTube Video ID (Embed Homepage)', icon: '🎥', color: 'text-red-500', placeholder: 'Contoh: dQw4w9WgXcQ' },
                    { key: 'instagram',     label: 'Instagram',             icon: '📸', color: 'text-pink-600',  placeholder: 'https://instagram.com/namaakun' },
                    { key: 'tiktok',        label: 'TikTok',                icon: '🎵', color: 'text-gray-900',  placeholder: 'https://tiktok.com/@namaakun' },
                    { key: 'facebook',      label: 'Facebook',              icon: '👍', color: 'text-blue-600',  placeholder: 'https://facebook.com/namahalaman' },
                  ].map(({ key, label, icon, color, placeholder }) => (
                    <Field key={key} label={<span className={`flex items-center gap-2 ${color}`}><span>{icon}</span>{label}</span>}>
                      <Input value={social[key]} onChange={setSM(key)} placeholder={placeholder} />
                    </Field>
                  ))}
                </div>
                <div className="p-4 bg-yellow-50">
                  <p className="text-xs text-yellow-800">
                    💡 <strong>Tips:</strong> YouTube Video ID adalah kode setelah <code className="bg-yellow-100 px-1 rounded">v=</code> di URL video. Contoh: youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>
                  </p>
                </div>
                <div className="p-6">
                  <SaveBtn onClick={saveSocial} saving={saving} label="Simpan Media Sosial" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══ Modal Galeri ══ */}
      <Modal isOpen={showGalleryModal} onClose={() => setShowGalleryModal(false)} title={editingGallery ? '✏️ Edit Foto' : '➕ Tambah Foto Baru'}>
        <div className="space-y-4">
          <Field label="Judul Foto" required>
            <Input value={galleryForm.title} onChange={v => setGalleryForm(f => ({ ...f, title: v }))} placeholder="Judul foto..." />
          </Field>
          <Field label="Kategori">
            <Input value={galleryForm.category} onChange={v => setGalleryForm(f => ({ ...f, category: v }))} placeholder="Kegiatan, Arsitektur, Ramadhan, dll" />
          </Field>
          <Field label="Gambar" required>
            <ImageUpload value={galleryForm.imageUrl} onChange={v => setGalleryForm(f => ({ ...f, imageUrl: v }))} getToken={getToken} />
          </Field>
          <Field label="Deskripsi">
            <Textarea value={galleryForm.description} onChange={v => setGalleryForm(f => ({ ...f, description: v }))} rows={2} placeholder="Deskripsi singkat..." />
          </Field>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowGalleryModal(false)} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium text-sm">Batal</button>
            <button onClick={saveGallery} disabled={saving} className="flex-1 py-2.5 bg-green-700 text-white rounded-xl hover:bg-green-800 disabled:opacity-50 font-medium text-sm">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ══ Modal Event ══ */}
      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title={editingEvent ? '✏️ Edit Berita/Acara' : '➕ Tambah Berita/Acara'}>
        <div className="space-y-4">
          <div className="flex gap-3">
            {[{ v: 'event', l: '📅 Acara' }, { v: 'news', l: '📰 Berita' }].map(opt => (
              <label key={opt.v} className={`flex-1 flex items-center justify-center py-2.5 border-2 rounded-xl cursor-pointer transition-all font-medium text-sm ${
                eventForm.type === opt.v ? 'border-green-600 bg-green-50 text-green-800' : 'border-gray-200 text-gray-500 hover:border-green-300'
              }`}>
                <input type="radio" value={opt.v} checked={eventForm.type === opt.v} onChange={e => setEventForm(f => ({ ...f, type: e.target.value }))} className="hidden" />
                {opt.l}
              </label>
            ))}
          </div>
          <Field label="Judul" required>
            <Input value={eventForm.title} onChange={v => setEventForm(f => ({ ...f, title: v }))} placeholder="Judul berita/acara..." />
          </Field>
          <Field label="Deskripsi">
            <Textarea value={eventForm.description} onChange={v => setEventForm(f => ({ ...f, description: v }))} rows={4} placeholder="Deskripsi lengkap..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal">
              <Input value={eventForm.date} onChange={v => setEventForm(f => ({ ...f, date: v }))} type="date" />
            </Field>
            <Field label="Lokasi">
              <Input value={eventForm.location} onChange={v => setEventForm(f => ({ ...f, location: v }))} placeholder="Aula masjid..." />
            </Field>
          </div>
          <Field label="Gambar (opsional)">
            <ImageUpload value={eventForm.imageUrl} onChange={v => setEventForm(f => ({ ...f, imageUrl: v }))} getToken={getToken} />
          </Field>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowEventModal(false)} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium text-sm">Batal</button>
            <button onClick={saveEvent} disabled={saving} className="flex-1 py-2.5 bg-green-700 text-white rounded-xl hover:bg-green-800 disabled:opacity-50 font-medium text-sm">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
