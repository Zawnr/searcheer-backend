const supabase = require('../../lib/supabase');

const getAllJobs = async (filters) => {
  let query = supabase
    .from('jobs')
    .select('job_id, title, location, industry, salary_range, employment_type')
    .eq('fraudulent', false);

  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
  }

  const arrayFilters = ['employment_type', 'required_experience', 'function'];
  for (const key of arrayFilters) {
    if (filters[key]) {
      const values = Array.isArray(filters[key]) ? filters[key] : [filters[key]];
      query = query.in(key, values);
    }
  }
  
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  
  query = query.limit(50).order('job_id');

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