import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.12.5:3001', 
});

export const fetchItems = async () => {
  try {
    const response = await api.get('/estoque');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    throw error;
  }
};

export const createItem = async (item) => {
  try {
    console.log('Requisição sendo enviada:', Array.from(item.entries())); 
    const response = await api.post('/estoque', item, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Resposta recebida:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar item:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteItem = async (id) => {
  try {
    console.log(`Deletando item com ID: ${id}`);
    const response = await api.delete(`/estoque/${id}`);
    console.log('Item deletado com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar item:', error.response?.data || error.message);
    throw error;
  }
};
export const updateProduct = async (id, updatedItem) => {
  try {
    const response = await api.put(`/estoque/${id}`, updatedItem, {
      headers: {
        'Content-Type': 'application/json', 
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar o produto:', error.response?.data || error.message);
    throw error;
  }
};

export default api;