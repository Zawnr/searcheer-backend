# Searcheer Backend 

Ini adalah layanan backend untuk aplikasi Analisis CV yang dibangun menggunakan Node.js dan framework Hapi.js. Layanan ini bertanggung jawab atas outhentifikasi pengguna, manajemen data (CV & Pekerjaan), dan berinteraksi dengan layanan eksternal seperti database Supabase dan API Machine Learning.

## ✨ Fitur Utama

-   **Manajemen Pengguna:** Registrasi, Login, lihat & perbarui profil, serta ubah password.
-   **Manajemen CV:** Upload file CV (format PDF) yang aman ke Supabase Storage.
-   **API Jobs:** Mengambil daftar pekerjaan dari database dengan dukungan filtering dan mengambil detail pekerjaan berdasarkan ID.
-   **Integrasi Machine Learning:**
    -   Analisis sinkron antara CV dan deskripsi pekerjaan via API ML.
    -   Menyimpan hasil analisis secara permanen di database.
    -   Mendapatkan rekomendasi pekerjaan alternatif berdasarkan hasil analisis.
-   **Riwayat Analisis:** Pengguna dapat melihat kembali semua riwayat analisis yang pernah dilakukan.
-   **Dokumentasi API Interaktif:** Dokumentasi otomatis yang dibuat dengan Swagger UI untuk kemudahan testing dan pengembangan.
-   **Keamanan & Validasi:** Validasi request yang masuk menggunakan Joi dan konfigurasi CORS.
-   **Optimasi Database:** Penggunaan *indexing* pada kolom kunci untuk performa query yang cepat.


## 🛠️ Teknologi yang Digunakan

-   **Backend:** Node.js, Hapi.js
-   **Database & Storage:** Supabase (PostgreSQL, Supabase Storage)
-   **Authentication:** JSON Web Tokens (@hapi/jwt)
-   **HTTP Client:** Axios
-   **Validasi:** Joi
-   **Dokumentasi:** hapi-swagger

## 🚀 Memulai Proyek

### Prasyarat

Sebelum memulai, pastikan sudah menginstal:
-   [Node.js](https://nodejs.org/) (disarankan versi LTS, misal: v18.x atau lebih baru)
-   npm (biasanya sudah terinstal bersama Node.js)
-   [Python](https://www.python.org/) (untuk menjalankan server ML)
-   Memiliki akun [Supabase](https://supabase.com/) untuk membuat proyek database.
-   Repositori layanan Machine Learning sudah di-clone dan di-setup sesuai petunjuk.

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
    Buat file `.env` di root proyek dengan menyalin dari `env.example`. Isi semua nilainya.
    ```bash
    cp .env.example .env
    ```
    **Isi `.env`:**
    ```env
    # Konfigurasi Server
    PORT=3000
    HOST=localhost

    # URL Frontend (untuk CORS di produksi)
    FRONTEND_URL=http://localhost:3001
    
    # Kunci JWT
    JWT_SECRET=ganti_dengan_kunci_rahasia_acak_yang_sangat_panjang

    # Kredensial Supabase
    SUPABASE_URL=https://sdpccyzdkogsfjxtkbrs.supabase.co
    SUPABASE_SERVICE_KEY= tanya zawawi aja ya gess!

    # URL API Machine Learning
    ML_API_BASE_URL=http://localhost:8000
    ```

4.  **Setup Database Supabase:**
    -   Buat proyek baru di Supabase.
    -   Gunakan **SQL Editor** untuk menjalankan perintah `CREATE TABLE` untuk tabel `users`, `jobs`, dan `cvs`.
    -   Impor data pekerjaan dari file `.csv` ke dalam tabel `jobs`.
    -   Jalankan perintah `CREATE TABLE` untuk `analysis_results`.
    -   Jalankan perintah `CREATE INDEX` untuk optimasi.
    -   Buat *Storage Bucket* bernama `cv-files` (private) dan atur *Policies*-nya.

### Menjalankan Aplikasi

Untuk menjalankan fitur analisis, **kedua server (Backend dan ML) harus berjalan bersamaan** di dua terminal terpisah.

1.  **Jalankan Backend Service (Hapi.js):**
    ```bash
    npm run dev
    ```

2.  **Jalankan Machine Learning Service (Python/FastAPI):**
    (Buka terminal baru di direktori proyek ML Anda)
    ```bash
    python api.py
    ```

Server backend akan berjalan di `http://localhost:3000`.

## 📚 Dokumentasi API

Setelah server berjalan, dokumentasi API yang interaktif tersedia melalui Swagger UI di:

**[http://localhost:3000/documentation](http://localhost:3000/documentation)**

Anda bisa melihat semua endpoint, model data, dan bahkan mencoba API secara langsung dari halaman tersebut. Untuk endpoint yang terproteksi, gunakan tombol "Authorize" setelah mendapatkan token dari endpoint login.

## Endpoints Utama

## Endpoints Utama

| Metode | Endpoint                                       | Deskripsi                                        | Otentikasi? |
| :----- | :--------------------------------------------- | :----------------------------------------------- | :---------- |
| `POST` | `/users/register`                              | Mendaftarkan pengguna baru.                      | Tidak       |
| `POST` | `/users/login`                                 | Login untuk mendapatkan token JWT.               | Tidak       |
| `GET`  | `/users/me`                                    | Mendapatkan profil pengguna yang login.          | **Ya** (JWT)    |
| `PATCH`| `/users/me`                                    | Memperbarui profil (username).                   | **Ya** (JWT)    |
| `PUT`  | `/users/me/password`                           | Mengubah password.                               | **Ya** (JWT)    |
| `POST` | `/cvs`                                         | Mengunggah file CV (PDF).                        | **Ya** (JWT)    |
| `POST` | `/cvs/{cvId}/analyze`                          | Memulai analisis CV terhadap deskripsi pekerjaan.  | **Ya** (JWT)    |
| `GET`  | `/cvs/{cvId}/analysis-results`                 | Melihat semua riwayat analisis untuk sebuah CV.   | **Ya** (JWT)    |
| `GET`  | `/analysis-results/{id}`                       | Melihat detail satu hasil analisis spesifik.     | **Ya** (JWT)    |
| `GET`  | `/analysis-results/{id}/recommendations`       | Mendapatkan rekomendasi pekerjaan dari hasil analisis. | **Ya** (JWT)    |
| `GET`  | `/jobs`                                        | Mendapatkan daftar pekerjaan (mendukung filter).  | Tidak       |
| `GET`  | `/jobs/{id}`                                   | Mendapatkan detail pekerjaan berdasarkan ID.       | Tidak       |

