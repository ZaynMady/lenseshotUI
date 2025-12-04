import axios from 'axios';
import { supabase } from '../secrets/supabaseClient';

// Replace these with your actual Railway URLs or set them in your .env file
const SCRIPTS_API_URL = import.meta.env.VITE_SCRIPTS_API_URL || 'https://your-scripts-service.up.railway.app/api'; 

// Helper to get the current Supabase Token
const getAuthToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

// Create Axios Instance
const scriptsApi = axios.create({ baseURL: SCRIPTS_API_URL });

// Request Interceptor to Inject Token
scriptsApi.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // --- Scripts Service ---
  
  // Create: Used when screenplay is "Initialized" (first save)
  createScreenplay: (name, content = [], projectId = null, template = 'american') => 
    scriptsApi.post('/create_screenplay', {
      screenplay_name: name,
      template_name: template,
      project_id: projectId,
      screenplayContent: content // Tiptap JSON
    }),

  // Save: Used when screenplay is "Opened" (subsequent saves)
  saveScreenplay: (name, content) => 
    scriptsApi.post('/save_screenplay', {
      screenplay_name: name,
      screenplay: content
    }),

  // List: To fetch available scripts
  listScreenplays: () => scriptsApi.post('/list_screenplays', {}),

  // Open: To load a script
  openScreenplay: (name) => scriptsApi.post('/open_screenplay', { screenplay_name: name }),
  
  // Delete
  deleteScreenplay: (name) => scriptsApi.post('/delete_screenplay', { screenplay_name: name }),
};