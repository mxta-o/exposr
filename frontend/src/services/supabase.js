// Fetch photos from backend API (which handles Supabase securely)
const API = 'http://localhost:3001/api';

// Get user's photos via backend
async function getUserPhotos(userId) {
  try {
    const token = localStorage.getItem('exposr_token');
    const response = await fetch(`${API}/photos/list/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to list photos:', response.status);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (err) {
    console.error('Error listing photos:', err);
    return [];
  }
}

window.supabaseService = { getUserPhotos };
