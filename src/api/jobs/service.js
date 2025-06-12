const supabase = require('../../lib/supabase');

// Escape karakter spesial untuk LIKE/ILIKE
function escapeLike(str) {
  return str.replace(/[%_]/g, (m) => '\\' + m);
}

const getAllJobs = async (filters) => {

  let query = supabase
    .from('jobs')
    .select('job_id, title, location, industry, salary_range, employment_type');

  // Terapkan filter jika ada
  if (filters.employment_type) {
    if (Array.isArray(filters.employment_type)) {
      query = query.in('employment_type', filters.employment_type);
    } else {
      query = query.eq('employment_type', filters.employment_type);
    }
  }
  if (filters.required_experience) {
    if (Array.isArray(filters.required_experience)) {
      query = query.in('required_experience', filters.required_experience);
    } else {
      query = query.eq('required_experience', filters.required_experience);
    }
  }
  if (filters.location) {
    // 'ilike' untuk pencarian case-insensitive (misalkan "new york" akan cocok dengan "New York")
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters.function) {
    if (Array.isArray(filters.function)) {
      query = query.in('function', filters.function);
    } else {
      query = query.eq('function', filters.function);
    }
  }
  // Jika filter q ada, tapi tidak ada satupun job yang cocok, jangan error 400, tetap return []
  // Supabase akan tetap return data: [] jika tidak ada yang cocok, error hanya jika query invalid
  // Namun, jika error 400 tetap muncul, kemungkinan karena filter lain (misal: ilike pada kolom yang tidak ada)
  // Pastikan kolom 'title' memang ada di tabel jobs

  // DEBUG LOG
  console.log('FILTERS:', filters);
  // Defensive: jika filters.q bukan string, abaikan
  if (filters.q && typeof filters.q === 'string' && filters.q.trim() !== '') {
    const safeQ = escapeLike(filters.q.trim());
    console.log('SAFEQ:', safeQ);
    query = query.ilike('title', `%${safeQ}%`);
  }
  // menambahkan limit dan urutan
  query = query.limit(50);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

const getJobById = async (jobId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*') 
    .eq('job_id', jobId)
    .single(); 

  if (error) throw new Error(error.message);
  return data;
};

module.exports = { getAllJobs, getJobById };