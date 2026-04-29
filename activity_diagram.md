# Activity Diagram Swimlane — Sistem Informasi Absensi (SI-ABSENSI)

> Setiap diagram menggunakan **swimlane** (subgraph per aktor) dengan arah alur kiri → kanan.
> Dapat di-render di [Mermaid Live](https://mermaid.live) atau GitLab/GitHub markdown.

---

## Diagram 1: Alur Login & Role Routing

```mermaid
flowchart LR
    subgraph USER["👤 PENGGUNA"]
        direction TB
        u1([Buka Aplikasi])
        u2[Input Email & Password]
        u3([Redirect ke /login])
        u4([Masuk Dashboard\nsesuai Role])
    end

    subgraph SYS1["💻 SISTEM"]
        direction TB
        s1[Halaman Login]
        s2{Autentikasi\nBerhasil?}
        s3[Tampilkan\nPesan Error]
        s4{Cek Role\nPengguna}
        s5[Arahkan ke\nDashboard Mahasiswa]
        s6[Arahkan ke\nDashboard Dosen]
        s7[Arahkan ke\nDashboard Admin]
    end

    subgraph DB1["🗄️ SUPABASE AUTH"]
        direction TB
        d1[(Verifikasi\nKredensial)]
        d2[(Baca Role\ndi metadata user)]
    end

    u1 --> s1
    s1 --> u2
    u2 --> d1
    d1 --> s2
    s2 -- Gagal --> s3
    s3 --> u3
    s2 -- Berhasil --> d2
    d2 --> s4
    s4 -- Mahasiswa --> s5
    s4 -- Dosen --> s6
    s4 -- Admin --> s7
    s5 & s6 & s7 --> u4
```

---

## Diagram 2: Alur Mahasiswa — Absensi Kuliah

```mermaid
flowchart LR
    subgraph MHS["🎓 MAHASISWA"]
        direction TB
        m1([Buka Dashboard])
        m2[Klik Scan Sekarang]
        m3([✅ Absensi Berhasil])
        m4([❌ Gagal: Di luar\nArea Kampus])
        m5([❌ Redirect /login])
    end

    subgraph SYS2["💻 SISTEM"]
        direction TB
        s1{Cek Auth\nUser?}
        s2[Tampilkan Dashboard\nProfil + Rekap Kehadiran]
        s3[Deteksi Jadwal Aktif\nInterval 30 detik]
        s4{Jadwal\nSedang Aktif?}
        s5[Tampil: Tidak Ada\nJadwal Aktif Saat Ini]
        s6[Tampilkan Kartu\nJadwal Aktif + Tombol Scan]
        s7[Verifikasi Geolokasi\nGeolocation API]
        s8{Dalam Radius\nKampus?}
        s9{Error Duplikat\n23505?}
        s10[Tampilkan:\nBerhasil Absen]
    end

    subgraph DB2["🗄️ SUPABASE DB"]
        direction TB
        d1[(SELECT mahasiswa\nwhere user_id)]
        d2[(SELECT jadwal\nwhere hari = hari_ini)]
        d3[(INSERT absensi\nstatus: Hadir\nwaktu: now)]
    end

    m1 --> s1
    s1 -- Tidak Login --> m5
    s1 -- Terautentikasi --> d1
    d1 --> s2
    s2 --> d2
    d2 --> s3
    s3 --> s4
    s4 -- Tidak --> s5
    s5 -.->|30 detik| s3
    s4 -- Ya --> s6
    s6 --> m2
    m2 --> s7
    s7 --> s8
    s8 -- Tidak --> m4
    s8 -- Ya --> d3
    d3 --> s9
    s9 -- Ya duplikat --> s10
    s9 -- Tidak --> s10
    s10 --> m3
```

---

## Diagram 3: Alur Dosen — Manajemen Sesi Kuliah

```mermaid
flowchart LR
    subgraph DOSEN["👨‍🏫 DOSEN"]
        direction TB
        d1([Buka Dashboard])
        d2[Pilih Tab\nToday / All / Upcoming]
        d3[Klik Launch Session]
        d4[Klik Lihat Histori]
        d5[Klik Reschedule]
        d6[Isi Tanggal &\nJam Pengganti]
        d7[Klik Confirm]
        d8([✅ Sesi / Data\nTerbarui])
        d9([❌ Redirect /login])
    end

    subgraph SYS3["💻 SISTEM"]
        direction TB
        s1{Cek Auth\nUser?}
        s2[Fetch Profil Dosen\nvia user_id]
        s3{Profil\nDitemukan?}
        s4[Log Error &\nNotifikasi]
        s5[Tampilkan Dashboard\nDaftar Mata Kuliah]
        s6{Filter\nJadwal}
        s7[Tampilkan Daftar\nMata Kuliah Terfilter]
        s8[Buka View\nLive Session]
        s9[Buka View\nLecture Matrix]
        s10[Buka Modal\nReschedule]
        s11{Form\nLengkap?}
        s12[Alert: Harap isi\ntanggal dan jam!]
        s13[Update State Lokal\nTutup Modal]
    end

    subgraph DB3["🗄️ SUPABASE DB"]
        direction TB
        da1[(SELECT jadwal\nwhere id_dosen)]
        da2[(UPDATE jadwal\nhari, jam_mulai\njam_selesai)]
    end

    d1 --> s1
    s1 -- Tidak Login --> d9
    s1 -- Terautentikasi --> s2
    s2 --> s3
    s3 -- Tidak --> s4
    s3 -- Ya --> da1
    da1 --> s5
    s5 --> d2
    d2 --> s6
    s6 --> s7
    s7 --> d3 & d4 & d5
    d3 --> s8
    s8 --> d8
    d4 --> s9
    s9 --> d8
    d5 --> s10
    s10 --> d6
    d6 --> d7
    d7 --> s11
    s11 -- Tidak --> s12
    s12 --> d6
    s11 -- Ya --> da2
    da2 --> s13
    s13 --> d8
```

---

## Diagram 4: Alur Admin — Koreksi & Manajemen Data

```mermaid
flowchart LR
    subgraph ADMIN["🛡️ ADMIN"]
        direction TB
        a1([Buka Dashboard])
        a2[Pilih Tab\ndi Sidebar]
        a3[Pilih Jadwal\ndari Dropdown]
        a4[Klik Edit Status]
        a5[Ubah Status\ndi Dropdown]
        a6[Klik Tambah Manual]
        a7[Cari Mahasiswa\nNama / NIM]
        a8[Pilih Mahasiswa\n+ Isi Status & Pertemuan]
        a9[Submit Form]
        a10[Input Data\nCRUD Mahasiswa/Dosen/Jadwal]
        a11([✅ Data Tersimpan])
        a12([❌ Tampil Pesan Error])
    end

    subgraph SYS4["💻 SISTEM"]
        direction TB
        s1[Dashboard Admin\nSidebar Navigasi]
        s2{Tab Dipilih}
        s3[Tab Koreksi:\nPilih Jadwal]
        s4[Fetch Data Absensi\nper Jadwal]
        s5{Ada Data\nAbsensi?}
        s6[Tampil: Belum ada\ndata presensi]
        s7[Tampilkan Tabel\nKehadiran]
        s8{Aksi\nAdmin}
        s9[Update State &\nKonfirmasi Berhasil]
        s10[Buka Modal\nInput Manual]
        s11[Tampilkan Hasil\nPencarian Mahasiswa]
        s12[Refresh Tabel\nData Terbarui]
        s13[Tab CRUD:\nForm Data]
        s14[Refresh UI\nData Terbarui]
        s15[Tab Laporan:\nFilter & Generate]
    end

    subgraph DB4["🗄️ SUPABASE DB"]
        direction TB
        db1[(SELECT absensi\nwhere id_jadwal)]
        db2[(UPDATE absensi\nstatus baru)]
        db3[(INSERT absensi\nmanual)]
        db4[(INSERT / UPDATE\n/ DELETE\nmhs / dosen / jadwal)]
        db5[(SELECT absensi\nuntuk laporan)]
    end

    a1 --> s1
    s1 --> a2
    a2 --> s2

    s2 -- Koreksi --> s3
    s3 --> a3
    a3 --> db1
    db1 --> s4
    s4 --> s5
    s5 -- Tidak --> s6
    s5 -- Ya --> s7
    s7 --> s8

    s8 -- Edit Status --> a4
    a4 --> a5
    a5 --> db2
    db2 --> s9
    s9 --> s7

    s8 -- Tambah Manual --> s10
    s10 --> a6
    a6 --> a7
    a7 --> s11
    s11 --> a8
    a8 --> a9
    a9 --> db3
    db3 -- Gagal --> a12
    db3 -- Berhasil --> s12
    s12 --> s7

    s2 -- Mahasiswa/Dosen/Jadwal --> s13
    s13 --> a10
    a10 --> db4
    db4 -- Gagal --> a12
    db4 -- Berhasil --> s14
    s14 --> a11

    s2 -- Laporan --> s15
    s15 --> db5
    db5 --> a11
```
