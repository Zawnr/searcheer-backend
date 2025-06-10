# Searcheer API Documentation 
**Version:** 1.0.0

Selamat datang di dokumentasi resmi untuk API Backend Searcheer. Layanan ini bertanggung jawab atas Authentication pengguna, manajemen data (CV & Pekerjaan), dan terintegrasi dengan layanan Machine Learning untuk memberikan analisis kecocokan serta rekomendasi pekerjaan.

- **Contact:** Searcheer Development Team (rochmat27nurza@gmail.com)

## Informasi Dasar
- **URL Production:** `http://<IP_PUBLIK>`
- **URL Development:** `http://localhost:3000`

## Authentication
This API using **JWT Bearer Token** for endpoint security that need users specific data.

1.  **Dapatkan Token:** Panggil endpoint `POST /users/login` dengan email dan password yang valid. Respons yang berhasil akan berisi sebuah token.
2.  **Gunakan Token:** Untuk mengakses endpoint yang terproteksi, sertakan token tersebut di dalam *header* `Authorization` dengan format:
    `Authorization: Bearer <token_jwt_anda>`

## Daftar Endpoint API

Endpoint dikelompokkan berdasarkan fungsionalitasnya.

### 👤 Users
Operasi yang berkaitan dengan pengguna (registrasi, login, profil).

#### **`POST /users/register`**
Mendaftarkan pengguna baru dengan username, email, dan password.
- **Authentication:** Tidak diperlukan.
- **Request Body:**
  ```json
  {
    "username": "userbaru123",
    "email": "userbaru@example.com",
    "password": "passwordkuat123"
  }
  ```
- **Respons Sukses (`201 Created`):** Mengembalikan objek profil pengguna yang baru dibuat.

---
#### **`POST /users/login`**
Login pengguna untuk mendapatkan token JWT Authentication.
- **Authentication:** Tidak diperlukan.
- **Request Body:**
  ```json
  {
    "email": "userbaru@example.com",
    "password": "passwordkuat123"
  }
  ```
- **Respons Sukses (`200 OK`):**
  ```json
  {
    "message": "Login berhasil",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---
#### **`GET /users/me`**
Mengambil detail profil dari pengguna yang sedang login.
- **Authentication:** **Diperlukan** (Bearer Token).
- **Respons Sukses (`200 OK`):** Mengembalikan objek profil pengguna.

---
#### **`PATCH /users/me`**
Memperbarui username dari pengguna yang sedang login.
- **Authentication:** **Diperlukan** (Bearer Token).
- **Request Body:**
  ```json
  {
    "username": "username_baru_saya"
  }
  ```
- **Respons Sukses (`200 OK`):** Mengembalikan objek profil pengguna yang sudah diperbarui.

---
#### **`PUT /users/me/password`**
Mengubah password pengguna setelah verifikasi password lama.
- **Authentication:** **Diperlukan** (Bearer Token).
- **Request Body:**
  ```json
  {
    "oldPassword": "password_lama_anda",
    "newPassword": "PasswordBaru123!",
    "confirmNewPassword": "PasswordBaru123!"
  }
  ```
- **Respons Sukses (`200 OK`):**
  ```json
  {
    "message": "Password berhasil diubah"
  }
  ```

---
### 📄 CVs
Operasi untuk mengelola CV pengguna.

#### **`POST /cvs`**
Mengunggah file CV baru (hanya PDF) oleh pengguna terautentikasi.
- **Authentication:** **Diperlukan** (Bearer Token).
- **Request Body:** `multipart/form-data` dengan key `file` yang berisi file PDF Anda.
- **Respons Sukses (`201 Created`):** Mengembalikan metadata dari file yang baru diunggah.

---
### 🔬 Analysis
Operasi untuk menjalankan dan melihat hasil analisis CV.

#### **`POST /cvs/{cvId}/analyze`**
Memulai analisis kecocokan antara sebuah CV dengan deskripsi pekerjaan yang diinput manual.
- **Authentication:** **Diperlukan** (Bearer Token).
- **Path Parameters:**
  - `cvId` (string, uuid): ID dari CV yang akan dianalisis.
- **Request Body:**
  ```json
  {
    "job_title": "Senior Backend Engineer",
    "job_description": "We are looking for a backend engineer with experience in Node.js..."
  }
  ```
- **Respons Sukses (`200 OK`):** Mengembalikan objek hasil analisis lengkap yang telah disimpan.

---
#### **`GET /cvs/{cvId}/analysis-results`**
Mendapatkan semua riwayat hasil analisis untuk sebuah CV.
- **Authentication:** **Diperlukan** (Bearer Token).
- **Path Parameters:**
  - `cvId` (string, uuid): ID dari CV yang riwayatnya ingin dilihat.
- **Respons Sukses (`200 OK`):** Mengembalikan sebuah *array* (daftar) dari objek hasil analisis.

---
#### **`GET /analysis-results/{id}`**
Mendapatkan detail dari satu hasil analisis spesifik.
- **Authentication:** **Diperlukan** (Bearer Token).
- **Path Parameters:**
  - `id` (string, uuid): ID unik dari hasil analisis.
- **Respons Sukses (`200 OK`):** Mengembalikan satu objek hasil analisis yang lengkap.

---
#### **`GET /analysis-results/{id}/recommendations`**
Mendapatkan rekomendasi pekerjaan alternatif berdasarkan hasil analisis.
- **Authentication:** **Diperlukan** (Bearer Token).
- **Path Parameters:**
  - `id` (string, uuid): ID dari hasil analisis yang akan digunakan sebagai dasar rekomendasi.
- **Respons Sukses (`200 OK`):** Mengembalikan sebuah *array* (daftar) dari objek pekerjaan yang direkomendasikan.

---
### 💼 Jobs
Operasi untuk melihat data pekerjaan.

#### **`GET /jobs`**
Mengambil daftar pekerjaan yang tersedia. Mendukung filtering.
- **Authentication:** Tidak diperlukan.
- **Query Parameters (Opsional):**
  - `employment_type` (string)
  - `required_experience` (string)
  - `location` (string)
  - `function` (string)
- **Respons Sukses (`200 OK`):** Mengembalikan sebuah *array* (daftar) dari objek ringkasan pekerjaan.

---
#### **`GET /jobs/{id}`**
Mendapatkan detail pekerjaan berdasarkan ID.
- **Authentication:** Tidak diperlukan.
- **Path Parameters:**
  - `id` (integer): ID unik dari pekerjaan.
- **Respons Sukses (`200 OK`):** Mengembalikan satu objek detail pekerjaan yang lengkap.


## Model Data (Skema)

Berikut adalah struktur data utama yang digunakan di dalam API ini.

### UserProfile
Objek yang merepresentasikan data profil pengguna publik.
```json
{
  "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "username": "johndoe",
  "email": "johndoe@example.com",
  "created_at": "2025-06-10T10:00:00Z"
}
```

### CV
Objek yang merepresentasikan metadata dari sebuah CV yang diunggah.
```json
{
  "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "user_id": "f1g2h3i4-j5k6-7l8m-9n0o-p1q2r3s4t5u6",
  "file_path": "public/f1g2h3i4-j5k6-7l8m-9n0o-p1q2r3s4t5u6-1678886400000.pdf",
  "status": "completed",
  "created_at": "2025-06-10T10:05:00Z",
  "updated_at": "2025-06-10T10:10:00Z"
}
```

### Job Summary
Objek ringkas yang merepresentasikan data pekerjaan untuk ditampilkan di daftar.
```json
{
  "job_id": 17830,
  "title": "Data Scientist",
  "location": "US, NY, New York",
  "industry": "Information Technology",
  "salary_range": "50000-60000",
  "employment_type": "Full-time"
}
```

### AnalysisResult
Objek lengkap yang berisi semua data hasil analisis.
```json
{
  "id": "0e1f2a3b-4c5d-4a7b-8c9d-a1b2c3d4e5f6",
  "cv_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "analyzed_job_title": "Senior Product Manager",
  "analyzed_job_description": "We are looking for an experienced product manager...",
  "cv_text": "Teks lengkap dari CV...",
  "created_at": "2025-06-10T10:15:00Z",
  "result_data": {
    "cv_analysis": {
      "ats_score": 85.5,
      "word_count": 450
    },
    "compatibility_analysis": {
      "overall_score": 78.5,
      "text_similarity": 65.2,
      "skill_match": 82.0,
      "experience_match": 75.0,
      "education_match": 80.0,
      "industry_match": 85.0,
      "recommendation_level": "STRONG_MATCH",
      "matched_skills": ["python", "sql"],
      "missing_skills": ["tensorflow"],
      "tips": ["Highlight your matching skills..."],
      "confidence_score": 0.78
    }
  }
}
```

---
## Kode Status & Respons Error

API ini menggunakan kode status HTTP standar untuk mengindikasikan keberhasilan atau kegagalan sebuah permintaan.

### Kode Status Sukses
-   **`200 OK`**: Permintaan berhasil. Biasanya untuk `GET`, `PATCH`, atau `PUT`.
-   **`201 Created`**: Sumber daya baru berhasil dibuat. Biasanya untuk `POST`.

### Kode Status Error
Semua respons error (rentang `4xx` dan `5xx`) akan mengikuti format standar berikut untuk konsistensi:
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Pesan error yang menjelaskan masalah."
}
```
---
Berikut adalah beberapa kode error umum yang mungkin Anda temui:
-   **`400 Bad Request`**: Permintaan tidak valid. Biasanya karena input dari pengguna salah (misalnya, password terlalu pendek, format email salah).
-   **`401 Unauthorized`**: Authentication gagal. Biasanya karena *header* `Authorization` tidak ada atau token JWT tidak valid.
-   **`403 Forbidden`**: Pengguna terautentikasi, tetapi tidak memiliki izin untuk mengakses sumber daya tersebut (misalnya, mencoba melihat riwayat analisis milik pengguna lain).
-   **`404 Not Found`**: Sumber daya yang diminta (seperti pekerjaan dengan ID tertentu) tidak ada di server.
-   **`409 Conflict`**: Permintaan tidak bisa diproses karena akan menyebabkan konflik data (misalnya, mendaftar dengan username atau email yang sudah ada).
-   **`500 Internal Server Error`**: Terjadi kesalahan tak terduga di dalam server backend kita.
-   **`502 Bad Gateway`**: Backend kita tidak bisa mendapatkan respons yang valid dari layanan eksternal (API Machine Learning).

---