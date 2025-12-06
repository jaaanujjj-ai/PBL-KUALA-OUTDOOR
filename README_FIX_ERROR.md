# 🚨 FIX ERROR: "Could not find the 'address' column"

## ⚡ SOLUSI SUPER CEPAT (5 MENIT)

### Langkah 1: Buka Supabase
1. Buka browser
2. Kunjungi: https://app.supabase.com
3. Login dengan akun Anda
4. Pilih project: **PBL-KELANA-OUTDOOR**

### Langkah 2: Buka SQL Editor
1. Di sidebar kiri, klik **"SQL Editor"** (icon ⚡)
2. Klik tombol **"New query"**

### Langkah 3: Copy & Paste SQL
1. Buka file: **`QUICK_FIX_DATABASE.sql`** (di root folder project)
2. **SELECT ALL** (Ctrl+A)
3. **COPY** (Ctrl+C)
4. **PASTE** ke Supabase SQL Editor (Ctrl+V)

### Langkah 4: Jalankan SQL
1. Klik tombol **"Run"** (atau tekan F5)
2. Tunggu beberapa detik
3. ✅ Jika sukses, akan muncul hasil query di bawah

### Langkah 5: Test di Aplikasi
1. Buka aplikasi Anda
2. **Hard Refresh** browser (Ctrl+Shift+R)
3. Login
4. Buka halaman **Profile**
5. Isi semua field
6. Klik **"Simpan Profil"**
7. ✅ **BERHASIL!** Error hilang!

---

## 📸 Screenshot Panduan

### 1️⃣ Supabase Dashboard
```
┌─────────────────────────────────────────┐
│ 🏠 Project: PBL-KELANA-OUTDOOR         │
│                                         │
│ Sidebar:                                │
│ ├─ 📊 Table Editor                     │
│ ├─ ⚡ SQL Editor     ← KLIK INI       │
│ ├─ 🔐 Authentication                   │
│ └─ 📦 Storage                          │
└─────────────────────────────────────────┘
```

### 2️⃣ SQL Editor
```
┌──────────────────────────────────────────┐
│  ⚡ SQL Editor                           │
│  [New query +]  [Run ▶]                 │
│ ┌────────────────────────────────────┐  │
│ │ -- PASTE SQL HERE                  │  │
│ │ ALTER TABLE profiles               │  │
│ │   ADD COLUMN IF NOT EXISTS ...     │  │
│ │                                    │  │
│ └────────────────────────────────────┘  │
│                                          │
│  [Run ▶]  ← KLIK SETELAH PASTE         │
└──────────────────────────────────────────┘
```

### 3️⃣ Hasil Sukses
```
✅ Success!
Rows: 15
Time: 234ms

column_name       | data_type  | is_nullable
------------------|------------|------------
id                | uuid       | NO
full_name         | varchar    | YES
identity_type     | varchar    | YES  ← NEW ✨
identity_number   | varchar    | YES  ← NEW ✨
birth_date        | date       | YES  ← NEW ✨
gender            | varchar    | YES  ← NEW ✨
phone             | varchar    | YES  ← NEW ✨
address           | text       | YES  ← NEW ✨
profile_picture   | varchar    | YES  ← NEW ✨
is_complete       | boolean    | YES  ← NEW ✨
```

---

## 🎯 Yang Akan Ditambahkan

SQL akan menambahkan kolom-kolom ini ke tabel `profiles`:

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `identity_type` | VARCHAR(10) | NIK/KTP/SIM |
| `identity_number` | VARCHAR(16) | Nomor identitas |
| `birth_date` | DATE | Tanggal lahir |
| `gender` | VARCHAR(20) | Laki-laki/Perempuan |
| `phone` | VARCHAR(13) | Nomor HP/WhatsApp |
| `address` | TEXT | Alamat lengkap ⚡ |
| `profile_picture` | VARCHAR(255) | URL foto profil |
| `is_complete` | BOOLEAN | Status kelengkapan |

---

## 🔍 Troubleshooting

### ❌ Error: "permission denied"
**Solusi:** Pastikan Anda login sebagai owner project

### ❌ Error: "column already exists"
**Solusi:** Ini normal! Artinya beberapa kolom sudah ada. SQL akan skip dan lanjut.

### ❌ Masih error setelah run SQL
**Solusi:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear cache browser
3. Restart dev server: 
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### ❌ Tidak bisa akses Supabase Dashboard
**Solusi:** 
- Pastikan internet stabil
- Clear cookies browser
- Coba browser lain (Chrome/Firefox)

---

## ✅ Verifikasi Berhasil

Setelah run SQL, cek dengan query ini:

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('address', 'phone', 'identity_type', 'gender');
```

**Expected Output:**
```
column_name     | data_type
----------------|----------
address         | text       ✅
phone           | varchar    ✅
identity_type   | varchar    ✅
gender          | varchar    ✅
```

Jika keempat kolom muncul = **SUKSES!** 🎉

---

## 📱 Test di Aplikasi

### Before Fix:
```
❌ Error menyimpan profil
   Could not find the 'address' column
```

### After Fix:
```
✅ Berhasil
   Profil Anda telah disimpan dengan sukses
```

---

## 💡 Tips

- **Backup data** sebelum run SQL (opsional, tapi recommended)
- SQL ini **aman** dijalankan multiple times (idempotent)
- Kolom yang sudah ada **tidak akan di-override**
- **Tidak ada data yang hilang**

---

## 🆘 Butuh Bantuan?

Jika masih error setelah mengikuti semua langkah:

1. Screenshot error yang muncul
2. Copy hasil query dari SQL Editor
3. Check console browser (F12 → Console tab)
4. Share error message lengkap

---

**TOTAL WAKTU: ~5 MENIT** ⏱️

Langkah-langkahnya simpel:
1. Buka Supabase SQL Editor (2 menit)
2. Paste & Run SQL (1 menit)
3. Refresh & Test aplikasi (2 menit)

**SELESAI!** 🎉
