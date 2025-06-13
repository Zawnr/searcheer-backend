const supabase = require('../../lib/supabase');

function escapeLike(str) {
  return str.replace(/[%_]/g, (m) => '\\' + m);
}

const getAllJobs = async (filters) => {
  console.log('Menerima filter:', filters);

  let query = supabase
    .from('jobs')
    .select('job_id, title, location, industry, salary_range, employment_type')

  if (filters.q && typeof filters.q === 'string' && filters.q.trim() !== '') {
    const safeQ = escapeLike(filters.q.trim());
    query = query.or(`title.ilike.%${safeQ}%,description.ilike.%${safeQ}%`);
  }
  const arrayFilters = ['employment_type', 'required_experience', 'function'];

  for (const key of arrayFilters) {
    if (filters[key]) {
      const values = Array.isArray(filters[key]) ? filters[key] : [filters[key]];
      query = query.in(key, values);
    }
  }

  if (filters.location && typeof filters.location === 'string') {
    query = query.ilike('location', `%${escapeLike(filters.location)}%`);
  }
  query = query.order('job_id', { ascending: false }).limit(50);
  
  const { data, error } = await query;
  if (error) {
    console.error("Supabase query error:", error);
    throw new Error(error.message);
  }

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