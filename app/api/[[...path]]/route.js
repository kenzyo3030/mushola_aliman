import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// MongoDB connection
let client = null;
let db = null;

async function getDb() {
  if (!client || !client.topology?.isConnected()) {
    client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
  }
  db = client.db(process.env.DB_NAME || 'mosque_db');
  return db;
}

async function ensureInitialized(db) {
  // Create default admin users if none exist
  const adminCount = await db.collection('admin').countDocuments({});
  if (adminCount === 0) {
    const users = [
      { username: 'yogi.setiawan', password: 'Y@ogi123', role: 'superadmin' },
      { username: 'malik', password: 'Aliman123', role: 'admin' },
    ];
    for (const u of users) {
      const hash = crypto.createHash('sha256').update(u.password).digest('hex');
      await db.collection('admin').insertOne({
        id: uuidv4(),
        username: u.username,
        passwordHash: hash,
        role: u.role,
        createdAt: new Date()
      });
    }
  }

  const profile = await db.collection('mosque_profile').findOne({});
  if (!profile) {
    await db.collection('mosque_profile').insertOne({
      id: uuidv4(),
      name: 'Mushola Al-Iman',
      arabicName: '\u0645\u0633\u062c\u062f \u0627\u0644\u0625\u062e\u0644\u0627\u0635',
      description: 'Mushola Al-Iman adalah tempat ibadah yang berdiri sejak tahun 1975. Kami berkomitmen untuk menjadi pusat kegiatan Islam yang membawa rahmat bagi seluruh masyarakat.',
      address: 'Jl. Raya Islam No. 1, Jakarta Selatan 12345',
      phone: '+62 21 1234567',
      email: 'info@mushola-aliman.id',
      imamName: 'Ustadz Ahmad Fauzi, Lc.',
      khatibName: 'Ustadz Muhammad Ridwan, M.Ag.',
      yearEstablished: '1975',
      capacity: '1000',
      vision: 'Menjadi mushola yang menjadi pusat peradaban Islam yang rahmatan lil \'alamin',
      mission: 'Membangun generasi Qurani yang berakhlak mulia, cerdas, dan bermanfaat bagi umat',
      updatedAt: new Date()
    });
  }

  const schedule = await db.collection('prayer_schedule').findOne({});
  if (!schedule) {
    await db.collection('prayer_schedule').insertOne({
      id: uuidv4(),
      fajr: '04:30',
      dhuhr: '12:00',
      asr: '15:15',
      maghrib: '18:05',
      isha: '19:15',
      jumuah: '12:00',
      subuhJamaah: '04:45',
      dzuhurJamaah: '12:15',
      asrJamaah: '15:30',
      maghribJamaah: '18:10',
      isyaJamaah: '19:30',
      updatedAt: new Date()
    });
  }

  const social = await db.collection('social_media').findOne({});
  if (!social) {
    await db.collection('social_media').insertOne({
      id: uuidv4(),
      youtube: '',
      instagram: '',
      tiktok: '',
      facebook: '',
      youtubeVideoId: '',
      updatedAt: new Date()
    });
  }
}

async function verifyToken(request, db) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7);
  const session = await db.collection('sessions').findOne({ token, active: true });
  return !!session;
}

export async function GET(request, { params }) {
  const path = params?.path || [];
  const route = '/' + path.join('/');

  try {
    const db = await getDb();
    await ensureInitialized(db);

    if (route === '/' || route === '') {
      return NextResponse.json({ message: 'Mosque API v1.0', status: 'ok' });
    }

    if (route === '/mosque-profile') {
      const profile = await db.collection('mosque_profile').findOne({}, { projection: { _id: 0 } });
      return NextResponse.json({ success: true, data: profile });
    }

    if (route === '/gallery') {
      const url = new URL(request.url);
      const category = url.searchParams.get('category');
      const query = category && category !== 'all' ? { category } : {};
      const gallery = await db.collection('gallery').find(query, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(200).toArray();
      return NextResponse.json({ success: true, data: gallery });
    }

    if (route === '/events') {
      const url = new URL(request.url);
      const type = url.searchParams.get('type');
      const query = type && type !== 'all' ? { type } : {};
      const events = await db.collection('events').find(query, { projection: { _id: 0 } }).sort({ date: -1 }).limit(100).toArray();
      return NextResponse.json({ success: true, data: events });
    }

    if (route === '/prayer-schedule') {
      const schedule = await db.collection('prayer_schedule').findOne({}, { projection: { _id: 0 } });
      return NextResponse.json({ success: true, data: schedule });
    }

    if (route === '/social-media') {
      const social = await db.collection('social_media').findOne({}, { projection: { _id: 0 } });
      return NextResponse.json({ success: true, data: social });
    }

    if (route.startsWith('/images/')) {
      const imageId = path[1];
      const image = await db.collection('images').findOne({ id: imageId }, { projection: { _id: 0 } });
      if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      const base64Data = image.data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const mimeType = image.data.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';
      return new Response(buffer, {
        headers: { 'Content-Type': mimeType, 'Cache-Control': 'public, max-age=31536000' }
      });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const path = params?.path || [];
  const route = '/' + path.join('/');

  try {
    const db = await getDb();
    await ensureInitialized(db);

    // Handle logout before parsing body (no body needed)
    if (route === '/auth/logout') {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await db.collection('sessions').updateOne({ token }, { $set: { active: false } });
      }
      return NextResponse.json({ success: true, message: 'Logout berhasil' });
    }

    const body = await request.json();

    if (route === '/auth/login') {
      const { username, password } = body;
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      const admin = await db.collection('admin').findOne({ username, passwordHash: hash });
      if (!admin) {
        return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 });
      }
      const token = 'admin_' + uuidv4();
      await db.collection('sessions').insertOne({
        id: uuidv4(),
        token,
        adminId: admin.id,
        active: true,
        createdAt: new Date()
      });
      return NextResponse.json({ success: true, token, message: 'Login berhasil' });
    }

    if (route === '/auth/logout') {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await db.collection('sessions').updateOne({ token }, { $set: { active: false } });
      }
      return NextResponse.json({ success: true, message: 'Logout berhasil' });
    }

    if (route === '/gallery') {
      if (!await verifyToken(request, db)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const item = { id: uuidv4(), ...body, createdAt: new Date() };
      await db.collection('gallery').insertOne(item);
      const { _id, ...itemWithoutId } = item;
      return NextResponse.json({ success: true, data: itemWithoutId });
    }

    if (route === '/events') {
      if (!await verifyToken(request, db)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const item = { id: uuidv4(), ...body, createdAt: new Date() };
      await db.collection('events').insertOne(item);
      const { _id, ...itemWithoutId } = item;
      return NextResponse.json({ success: true, data: itemWithoutId });
    }

    if (route === '/upload') {
      if (!await verifyToken(request, db)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const { imageData, filename } = body;
      if (!imageData) return NextResponse.json({ error: 'No image data' }, { status: 400 });
      const imageId = uuidv4();
      await db.collection('images').insertOne({
        id: imageId,
        data: imageData,
        filename: filename || 'upload.jpg',
        createdAt: new Date()
      });
      return NextResponse.json({ success: true, imageUrl: `/api/images/${imageId}`, id: imageId });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const path = params?.path || [];
  const route = '/' + path.join('/');

  try {
    const db = await getDb();
    if (!await verifyToken(request, db)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();

    if (route === '/mosque-profile') {
      const { _id, id, ...updateData } = body;
      await db.collection('mosque_profile').updateOne({}, { $set: { ...updateData, updatedAt: new Date() } }, { upsert: true });
      const updated = await db.collection('mosque_profile').findOne({}, { projection: { _id: 0 } });
      return NextResponse.json({ success: true, data: updated });
    }

    if (route.startsWith('/gallery/')) {
      const itemId = path[1];
      const { _id, id, ...updateData } = body;
      await db.collection('gallery').updateOne({ id: itemId }, { $set: { ...updateData, updatedAt: new Date() } });
      const updated = await db.collection('gallery').findOne({ id: itemId }, { projection: { _id: 0 } });
      return NextResponse.json({ success: true, data: updated });
    }

    if (route.startsWith('/events/')) {
      const itemId = path[1];
      const { _id, id, ...updateData } = body;
      await db.collection('events').updateOne({ id: itemId }, { $set: { ...updateData, updatedAt: new Date() } });
      const updated = await db.collection('events').findOne({ id: itemId }, { projection: { _id: 0 } });
      return NextResponse.json({ success: true, data: updated });
    }

    if (route === '/prayer-schedule') {
      const { _id, id, ...updateData } = body;
      await db.collection('prayer_schedule').updateOne({}, { $set: { ...updateData, updatedAt: new Date() } }, { upsert: true });
      const updated = await db.collection('prayer_schedule').findOne({}, { projection: { _id: 0 } });
      return NextResponse.json({ success: true, data: updated });
    }

    if (route === '/social-media') {
      const { _id, id, ...updateData } = body;
      await db.collection('social_media').updateOne({}, { $set: { ...updateData, updatedAt: new Date() } }, { upsert: true });
      const updated = await db.collection('social_media').findOne({}, { projection: { _id: 0 } });
      return NextResponse.json({ success: true, data: updated });
    }

    if (route === '/admin/password') {
      const { currentPassword, newPassword } = body;
      const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
      const admin = await db.collection('admin').findOne({ username: 'admin', passwordHash: currentHash });
      if (!admin) return NextResponse.json({ success: false, error: 'Password lama salah' }, { status: 400 });
      const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
      await db.collection('admin').updateOne({ username: 'admin' }, { $set: { passwordHash: newHash } });
      return NextResponse.json({ success: true, message: 'Password berhasil diubah' });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const path = params?.path || [];
  const route = '/' + path.join('/');

  try {
    const db = await getDb();
    if (!await verifyToken(request, db)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (route.startsWith('/gallery/')) {
      const itemId = path[1];
      await db.collection('gallery').deleteOne({ id: itemId });
      return NextResponse.json({ success: true, message: 'Foto berhasil dihapus' });
    }

    if (route.startsWith('/events/')) {
      const itemId = path[1];
      await db.collection('events').deleteOne({ id: itemId });
      return NextResponse.json({ success: true, message: 'Acara berhasil dihapus' });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
