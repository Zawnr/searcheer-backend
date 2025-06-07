# Searcheer Backend 

Ini adalah layanan backend untuk aplikasi Analisis CV yang dibangun menggunakan Node.js dan framework Hapi.js. Layanan ini bertanggung jawab atas outhentifikasi pengguna, manajemen data (CV & Pekerjaan), dan berinteraksi dengan layanan eksternal seperti database Supabase dan API Machine Learning.

## ✨ Fitur Utama

-   **Otentikasi Pengguna:** Registrasi dan Login aman menggunakan JSON Web Tokens (JWT).
-   **Manajemen CV:** Upload file CV (format PDF) yang aman ke Supabase Storage.
-   **API Jobs:** Mengambil daftar pekerjaan dari database dengan dukungan filtering dan mengambil detail pekerjaan berdasarkan ID.
-   **Dokumentasi API Interaktif:** Dokumentasi otomatis yang dibuat dengan Swagger UI untuk kemudahan testing dan pengembangan.
-   **Validasi:** Validasi request yang masuk menggunakan Joi untuk memastikan integritas data.

## 🛠️ Teknologi yang Digunakan

-   **Backend:** Node.js, Hapi.js
-   **Database & Storage:** Supabase (PostgreSQL, Supabase Storage)
-   **Authentication:** JSON Web Tokens (@hapi/jwt)
-   **Validation:** Joi
-   **Documentation:** hapi-swagger

## 🚀 Memulai Proyek

### Prasyarat

Sebelum memulai, pastikan sudah menginstal:
-   [Node.js](https://nodejs.org/) (disarankan versi LTS, misal: v18.x atau lebih baru)
-   npm (biasanya sudah terinstal bersama Node.js)
-   Memiliki akun [Supabase](https://supabase.com/) untuk membuat proyek database.

### Instalasi & Konfigurasi

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/Zawnr/searcheer-backend.git](https://github.com/Zawnr/searcheer-backend.git)
    cd searcheer-backend
    ```

2.  **Instal semua dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variables:**
    Buat file baru bernama `.env` di root proyek. Salin isi dari `.env.example` (jika ada) atau gunakan format di bawah ini dan isi nilainya sesuai dengan proyek Supabase Anda.

    ```env
    # Konfigurasi Server
    PORT=3000
    HOST=localhost

    # Kunci Rahasia JWT
    JWT_SECRET=ganti_dengan_kunci_rahasia_acak_yang_sangat_panjang

    # Kredensial Supabase
    SUPABASE_URL=https://sdpccyzdkogsfjxtkbrs.supabase.co
    SUPABASE_SERVICE_KEY= tanya zawawi aja ya gess!
    ```

4.  **Setup Database Supabase:**
    -   Buat proyek baru di Supabase.
    -   Buat tabel `users`, `cvs`, dan `jobs` menggunakan SQL Editor sesuai skema yang telah kita rancang.
    -   Impor data pekerjaan dari file `.csv` ke dalam tabel `jobs`.
    -   Buat sebuah *Storage Bucket* bernama `cv-files` (private).
    -   Pastikan Anda sudah membuat *Policies* untuk bucket storage agar file bisa diunggah dan diakses.

### Menjalankan Aplikasi

-   **Mode Pengembangan (dengan auto-reload):**
    ```bash
    npm run dev
    ```

-   **Mode Produksi:**
    ```bash
    npm run start
    ```

Server akan berjalan di `http://localhost:3000`.

## 📚 Dokumentasi API

Setelah server berjalan, dokumentasi API yang interaktif tersedia melalui Swagger UI di:

**[http://localhost:3000/documentation](http://localhost:3000/documentation)**

Anda bisa melihat semua endpoint, model data, dan bahkan mencoba API secara langsung dari halaman tersebut. Untuk endpoint yang terproteksi, gunakan tombol "Authorize" setelah mendapatkan token dari endpoint login.

## Endpoints Utama

| Metode | Endpoint             | Deskripsi                                   | Auth? |
| :----- | :------------------- | :------------------------------------------ | :---------- |
| `POST` | `/users/register`    | Mendaftarkan pengguna baru.                 | Tidak       |
| `POST` | `/users/login`       | Login untuk mendapatkan token JWT.          | Tidak       |
| `POST` | `/cvs`               | Mengunggah file CV (PDF).                   | Ya (JWT)    |
| `GET`  | `/jobs`              | Mendapatkan daftar pekerjaan (mendukung filter). | Tidak       |
| `GET`  | `/jobs/{id}`         | Mendapatkan detail pekerjaan berdasarkan ID.  | Tidak       |
