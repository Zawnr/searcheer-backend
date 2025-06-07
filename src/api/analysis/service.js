const axios = require('axios');
const FormData = require('form-data');
const supabase = require('../../lib/supabase');
const Boom = require('@hapi/boom');
const pdf = require('pdf-parse'); 

const startAnalysisService = async ({ cvId, userId, jobTitle, jobDescription }) => {
  // 1. Validasi Kepemilikan & Ambil Path File CV
  const { data: cvData, error: cvError } = await supabase
    .from('cvs')
    .select('id, user_id, file_path')
    .eq('id', cvId)
    .single();

  if (cvError || !cvData) throw Boom.notFound('CV tidak ditemukan.');
  if (cvData.user_id !== userId) throw Boom.forbidden('Anda tidak memiliki akses ke CV ini.');

  // 2. Ambil File CV dari Supabase Storage (ini mengembalikan Blob)
  const { data: fileBlob, error: storageError } = await supabase.storage
    .from('cv-files')
    .download(cvData.file_path);

  if (storageError) throw Boom.internal('Gagal mengunduh file CV dari storage.', storageError);

  // Blob memiliki method .arrayBuffer() yang mengembalikan Promise
  const arrayBuffer = await fileBlob.arrayBuffer();
  // Konversi ArrayBuffer ke Node.js Buffer
  const fileBuffer = Buffer.from(arrayBuffer);

  const pdfData = await pdf(fileBuffer);
  const cvText = pdfData.text;

  // 3. Kirim Request ke API Machine Learning
  const formData = new FormData();
  // Gunakan fileBuffer yang sudah dikonversi
  formData.append('file', fileBuffer, { filename: 'cv.pdf' });
  formData.append('job_title', jobTitle);
  formData.append('job_description', jobDescription);

  let mlResponse;
  try {
    const mlApiUrl = `${process.env.ML_API_BASE_URL}/api/analyze/cv-with-job`;
    mlResponse = await axios.post(mlApiUrl, formData, { headers: formData.getHeaders() });
  } catch (error) {
    console.error('Error saat memanggil API ML:', error.response ? error.response.data : error.message);
    throw Boom.badGateway('Layanan analisis sedang tidak tersedia atau terjadi kesalahan.');
  }

  const analysisResult = mlResponse.data;
  if (!analysisResult || !analysisResult.success) {
    throw Boom.badRequest('Analisis gagal dilakukan oleh layanan ML.', analysisResult.errors);
  }

  // 4. Simpan Hasil Analisis
  const { data: savedResult, error: saveError } = await supabase
    .from('analysis_results')
    .insert({
      cv_id: cvId,
      analyzed_job_title: jobTitle,
      analyzed_job_description: jobDescription,
      result_data: analysisResult.data,
      cv_text: cvText,
    })
    .select()
    .single();

  if (saveError) {
    if (saveError.code === '23505') {
      throw Boom.conflict('CV ini sudah pernah dianalisis untuk pekerjaan ini sebelumnya.');
    }
    throw Boom.internal('Gagal menyimpan hasil analisis.', saveError);
  }
  
  // 5. Update status CV (opsional)
  await supabase.from('cvs').update({ status: 'completed' }).eq('id', cvId);

  return savedResult;
};

const getAnalysisResultById = async ({ resultId, userId }) => {
  // Query ini sedikit kompleks karena kita perlu memastikan pengguna
  // yang meminta adalah pemilik CV yang terkait dengan hasil analisis ini.
  const { data, error } = await supabase
    .from('analysis_results')
    .select(`
      *,
      cv:cvs ( user_id )
    `)
    .eq('id', resultId)
    .single();

  if (error || !data) {
    throw Boom.notFound('Hasil analisis tidak ditemukan.');
  }

  // Lakukan pengecekan keamanan
  if (data.cv.user_id !== userId) {
    throw Boom.forbidden('Anda tidak memiliki akses ke hasil analisis ini.');
  }

  // Hapus data join yang tidak perlu sebelum dikirim ke user
  delete data.cv;

  return data;
};

const getAllResultsByCvId = async ({ cvId, userId }) => {
  // 1. Pertama, pastikan pengguna adalah pemilik CV
  const { data: cvData, error: cvError } = await supabase
    .from('cvs')
    .select('user_id')
    .eq('id', cvId)
    .single();

  if (cvError || !cvData) {
    throw Boom.notFound('CV tidak ditemukan.');
  }
  if (cvData.user_id !== userId) {
    throw Boom.forbidden('Anda tidak memiliki akses ke riwayat CV ini.');
  }

  // 2. Jika aman, baru ambil semua hasil analisis untuk CV tersebut
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('cv_id', cvId)
    .order('created_at', { ascending: false });

  if (error) {
    throw Boom.internal('Gagal mengambil riwayat analisis.');
  }

  return data;
};

const getJobRecommendations = async ({ resultId, userId }) => {
  // 1. Ambil data analisis lengkap yang sudah tersimpan di database kita
  const existingResult = await getAnalysisResultById({ resultId, userId });

  if (!existingResult || !existingResult.cv_text) {
    throw Boom.badRequest('Data analisis atau teks CV tidak ditemukan untuk pengujian ini.');
  }

  // Ambil bagian data yang relevan dari hasil analisis pertama
  const compatibilityData = existingResult.result_data.compatibility_analysis;

  // --- INI BAGIAN UTAMA: KITA BUAT PAYLOAD SESUAI CONTOH .json ANDA ---
  const payloadForML = {
    cv_text: existingResult.cv_text,
    analysis_results: {
      overall_score: compatibilityData.overall_score,
      // Buat objek 'skills_analysis' yang dibutuhkan
      skills_analysis: {
        // Ubah format array skill menjadi [skill, skor] seperti contoh
        matched_skills: compatibilityData.matched_skills.map(skill => [skill, 1.0]), // Kita beri skor dummy 1.0
        missing_skills: compatibilityData.missing_skills.map(skill => [skill, 1.0]),
        skill_match_percentage: compatibilityData.skill_match,
      }
    },
    top_n: 6, 
  };
  // -----------------------------------------------------------------

  console.log('Mengirim payload FINAL ke API ML:', JSON.stringify(payloadForML, null, 2));

  // 3. Panggil API ML untuk mendapatkan rekomendasi
  let recommendationsResponse;
  try {
    const mlApiUrl = `${process.env.ML_API_BASE_URL}/api/find-alternative-jobs`;
    recommendationsResponse = await axios.post(mlApiUrl, payloadForML);
  } catch (error) {
    console.error('Error saat memanggil API rekomendasi ML:', error.response ? error.response.data : error.message);
    throw Boom.badGateway('Layanan rekomendasi sedang tidak tersedia.');
  }

  const recommendationsFromML = recommendationsResponse.data?.data?.recommended_jobs;
  if (!recommendationsFromML) {
    // Jika tidak ada rekomendasi, kembalikan array kosong, ini bukan error
    return [];
  }

  // 4. Proses 'penyempurnaan' data (seperti yang kita diskusikan)
  const recommendedJobIds = recommendationsFromML.map(job => job.job_id).filter(id => id != null);
  if (recommendedJobIds.length === 0) {
    return [];
  }

  const { data: jobsFromDb, error: dbError } = await supabase
    .from('jobs')
    .select('job_id, title, location, industry, salary_range, employment_type')
    .in('job_id', recommendedJobIds);

  if (dbError) {
    throw Boom.internal('Gagal mengambil detail pekerjaan rekomendasi dari database.');
  }

  const enrichedRecommendations = jobsFromDb.map(dbJob => {
    const mlData = recommendationsFromML.find(mlJob => mlJob.job_id === dbJob.job_id);
    return {
      ...dbJob,
      compatibility_score: mlData ? mlData.compatibility_score : null,
    };
  });

  return enrichedRecommendations;
};

module.exports = { startAnalysisService, getAllResultsByCvId, getAnalysisResultById, getJobRecommendations };