export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

let client
let db

async function getDb() {

  const uri = process.env.MONGO_URL

  if (!uri) {
    throw new Error("MONGO_URL environment variable belum diset")
  }

  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
  }

  if (!db) {
    db = client.db(process.env.DB_NAME || "mosque_db")
  }

  return db
}

async function ensureInitialized(db) {

  // ADMIN
  const adminCount = await db.collection('admin').countDocuments()

  if (adminCount === 0) {

    const users = [
      { username: 'yogi.setiawan', password: 'Y@ogi123', role: 'superadmin' },
      { username: 'malik', password: 'Aliman123', role: 'admin' }
    ]

    for (const u of users) {

      const hash = crypto.createHash('sha256').update(u.password).digest('hex')

      await db.collection('admin').insertOne({
        id: uuidv4(),
        username: u.username,
        passwordHash: hash,
        role: u.role,
        createdAt: new Date()
      })

    }

  }

  // MOSQUE PROFILE
  const profile = await db.collection('mosque_profile').findOne()

  if (!profile) {

    await db.collection('mosque_profile').insertOne({
      id: uuidv4(),
      name: 'Mushola Al-Iman',
      arabicName: 'مسجد الإخلاص',
      description: 'Mushola Al-Iman adalah tempat ibadah.',
      address: 'Jl. Raya Islam No.1',
      phone: '+62 21 1234567',
      email: 'info@mushola-aliman.id',
      imamName: 'Ustadz Ahmad Fauzi',
      khatibName: 'Ustadz Muhammad Ridwan',
      yearEstablished: '1975',
      capacity: '1000',
      vision: 'Menjadi mushola yang membawa rahmat bagi masyarakat',
      mission: 'Membangun generasi Qurani',
      updatedAt: new Date()
    })

  }

  // PRAYER SCHEDULE
  const schedule = await db.collection('prayer_schedule').findOne()

  if (!schedule) {

    await db.collection('prayer_schedule').insertOne({
      id: uuidv4(),
      fajr: '04:30',
      dhuhr: '12:00',
      asr: '15:15',
      maghrib: '18:05',
      isha: '19:15',
      updatedAt: new Date()
    })

  }

  // SOCIAL MEDIA
  const social = await db.collection('social_media').findOne()

  if (!social) {

    await db.collection('social_media').insertOne({
      id: uuidv4(),
      youtube: "",
      instagram: "",
      tiktok: "",
      facebook: "",
      updatedAt: new Date()
    })

  }

}

async function verifyToken(request, db) {

  const authHeader = request.headers.get('authorization')

  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')

  const session = await db.collection('sessions').findOne({
    token,
    active: true
  })

  return !!session

}

function getRoute(params) {
  const path = params?.path || []
  return '/' + path.join('/')
}

export async function GET(request, { params }) {

  try {

    const db = await getDb()
    await ensureInitialized(db)

    const route = getRoute(params)

    if (route === '/mosque-profile') {

      const data = await db.collection('mosque_profile')
        .findOne({}, { projection: { _id: 0 } })

      return NextResponse.json({ success: true, data })

    }

    if (route === '/prayer-schedule') {

      const data = await db.collection('prayer_schedule')
        .findOne({}, { projection: { _id: 0 } })

      return NextResponse.json({ success: true, data })

    }

    if (route === '/social-media') {

      const data = await db.collection('social_media')
        .findOne({}, { projection: { _id: 0 } })

      return NextResponse.json({ success: true, data })

    }

    if (route === '/gallery') {

      const data = await db.collection('gallery')
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray()

      return NextResponse.json({ success: true, data })

    }

    if (route === '/events') {

      const data = await db.collection('events')
        .find({}, { projection: { _id: 0 } })
        .sort({ date: -1 })
        .toArray()

      return NextResponse.json({ success: true, data })

    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 })

  } catch (error) {

    console.error(error)

    return NextResponse.json({ error: error.message }, { status: 500 })

  }

}

export async function POST(request, { params }) {

  try {

    const db = await getDb()
    const route = getRoute(params)
    const body = await request.json()

    if (route === '/auth/login') {

      const { username, password } = body

      const hash = crypto.createHash('sha256').update(password).digest('hex')

      const admin = await db.collection('admin')
        .findOne({ username, passwordHash: hash })

      if (!admin) {

        return NextResponse.json({
          success: false,
          message: 'Username atau password salah'
        }, { status: 401 })

      }

      const token = 'admin_' + uuidv4()

      await db.collection('sessions').insertOne({
        id: uuidv4(),
        token,
        adminId: admin.id,
        active: true,
        createdAt: new Date()
      })

      return NextResponse.json({ success: true, token })

    }

    if (route === '/gallery') {

      if (!await verifyToken(request, db)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const item = {
        id: uuidv4(),
        ...body,
        createdAt: new Date()
      }

      await db.collection('gallery').insertOne(item)

      return NextResponse.json({ success: true, data: item })

    }

    if (route === '/events') {

      if (!await verifyToken(request, db)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const item = {
        id: uuidv4(),
        ...body,
        createdAt: new Date()
      }

      await db.collection('events').insertOne(item)

      return NextResponse.json({ success: true, data: item })

    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 })

  } catch (error) {

    console.error(error)

    return NextResponse.json({ error: error.message }, { status: 500 })

  }

}

export async function PUT(request, { params }) {

  try {

    const db = await getDb()
    const route = getRoute(params)

    if (!await verifyToken(request, db)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (route === '/social-media') {

      const { _id, id, ...updateData } = body

      await db.collection('social_media').updateOne(
        {},
        { $set: { ...updateData, updatedAt: new Date() } },
        { upsert: true }
      )

      const updated = await db.collection('social_media')
        .findOne({}, { projection: { _id: 0 } })

      return NextResponse.json({ success: true, data: updated })

    }

    if (route === '/prayer-schedule') {

      const { _id, id, ...updateData } = body

      await db.collection('prayer_schedule').updateOne(
        {},
        { $set: { ...updateData, updatedAt: new Date() } },
        { upsert: true }
      )

      const updated = await db.collection('prayer_schedule')
        .findOne({}, { projection: { _id: 0 } })

      return NextResponse.json({ success: true, data: updated })

    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 })

  } catch (error) {

    console.error(error)

    return NextResponse.json({ error: error.message }, { status: 500 })

  }

}