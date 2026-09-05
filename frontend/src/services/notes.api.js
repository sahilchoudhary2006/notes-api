import api from './api';

export const getNotes = async (params = {}) => {
  const { page = 1, limit = 10, search = '', sort = 'latest', type = 'all' } = params;
  
  // Construct query string manually or via URLSearchParams
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  if (search) queryParams.append('search', search);
  if (sort) queryParams.append('sort', sort);
  if (type && type !== 'all') queryParams.append('type', type);

  const response = await api.get(`/notes?${queryParams.toString()}`);
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await api.post('/notes', noteData);
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const response = await api.patch(`/notes/${id}`, noteData);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};
