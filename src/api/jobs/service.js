const supabase = require('../../lib/supabase');

const getAllJobs = async (filters) => {

  let query = supabase
    .from('jobs')
    .select('job_id, title, location, industry, salary_range, employment_type')
    .eq('fraudulent', false); // Hanya tampilkan pekerjaan yang tidak palsu

  // Terapkan filter jika ada
  if (filters.employment_type) {
    query = query.eq('employment_type', filters.employment_type);
  }
  if (filters.required_experience) {
    query = query.eq('required_experience', filters.required_experience);
  }
  if (filters.location) {
    // 'ilike' untuk pencarian case-insensitive (misalkan "new york" akan cocok dengan "New York")
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters.function) {
    query = query.eq('function', filters.function);
  }

  // Tambahkan limit dan urutan
  query = query.limit(50); // Batasi hasil agar tidak terlalu banyak

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

const getJobById = async (jobId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*') // Ambil semua detail untuk halaman detail
    .eq('job_id', jobId)
    .eq('fraudulent', false)
    .single(); // Ambil satu baris saja

  if (error) throw new Error(error.message);
  return data;
};

module.exports = { getAllJobs, getJobById };