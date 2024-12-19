import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Button, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { fetchItems, createItem, deleteItem, updateProduct } from '../api';

const formatCurrency = (value) => {
  const numericValue = value.replace(/\D/g, '');
  const formattedValue = (numericValue / 100).toFixed(2).toString();
  return formattedValue.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const HomeScreen = () => {
  const [items, setItems] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: '',
    type: 'outros',
  });
  const handleUpdateQuantity = async (id, newQuantity) => {
    try {
      const itemToUpdate = items.find((item) => item._id === id);
  
      if (itemToUpdate) {
        // Atualiza localmente os itens para refletir imediatamente a alteração
        const updatedItems = items.map((item) =>
          item._id === id ? { ...item, quantity: newQuantity } : item
        );
        setItems(updatedItems);
  
        // Construir o objeto com os dados a serem atualizados
        const updatedItem = {
          name: itemToUpdate.name,
          description: itemToUpdate.description,
          price: itemToUpdate.price,
          quantity: newQuantity,
          type: itemToUpdate.type,
          image: itemToUpdate.image, // Sempre enviar a imagem
        };
  
        // Chamar o método PUT para atualizar o item no backend
        const response = await updateProduct(id, updatedItem);
        console.log('Produto atualizado com sucesso:', response);
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error.response?.data || error.message);
    }
  };
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  };
  const handleDeleteItem = async (id) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja excluir este item?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await deleteItem(id); // Chama a API para excluir o item
              setItems((prevItems) => prevItems.filter((item) => item._id !== id)); // Remove o item da lista local
              console.log(`Item com ID ${id} excluído com sucesso.`);
            } catch (error) {
              console.error('Erro ao excluir item:', error.response?.data || error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  const handleCreateItem = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('description', newItem.description);
      formData.append('price', parseFloat(newItem.price.replace(/\./g, '').replace(',', '.')));
      formData.append('quantity', parseInt(newItem.quantity, 10));
      formData.append('type', newItem.type);

      if (newItem.image) {
        formData.append('image', {
          uri: newItem.image,
          type: 'image/jpeg',
          name: 'upload.jpg',
        });
      }

      await createItem(formData);
      setModalVisible(false);
      loadItems();
      setNewItem({ name: '', description: '', price: '', quantity: '', image: '', type: 'outros' });
    } catch (error) {
      console.error('Erro ao criar item:', error.response?.data || error.message);
    }
  };

  const handleClearFields = () => {
    setNewItem({ name: '', description: '', price: '', quantity: '', image: '', type: 'outros' });
  };

  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewItem((prevState) => ({ ...prevState, image: result.assets[0].uri }));
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, marginVertical: 8, marginHorizontal: 10, padding: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 3 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 10 }} />
      </View>
      <View style={{ flex: 2, paddingLeft: 10, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{item.name}</Text>
        <Text style={{ fontSize: 14, color: '#666', marginVertical: 4 }}>{item.description}</Text>
        <Text style={{ fontSize: 14, color: '#555' }}>Preço: R$ {item.price.toFixed(2).replace('.', ',')}</Text>
        <Text style={{ fontSize: 14, color: '#555' }}>Categoria: {item.type}</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ backgroundColor: '#007bff', padding: 5, borderRadius: 5, width: 30, alignItems: 'center' }}
            onPress={() => handleUpdateQuantity(item._id, item.quantity + 1)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>+</Text>
          </TouchableOpacity>
          <Text style={{ marginHorizontal: 10, fontSize: 16, fontWeight: 'bold' }}>{item.quantity}</Text>
          <TouchableOpacity
            style={{ backgroundColor: '#007bff', padding: 5, borderRadius: 5, width: 30, alignItems: 'center' }}
            onPress={() => handleUpdateQuantity(item._id, Math.max(0, item.quantity - 1))}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>-</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{ backgroundColor: '#ff4d4d', padding: 5, borderRadius: 5, marginTop: 10, width: '80%', alignItems: 'center' }} onPress={() => handleDeleteItem(item._id)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item._id.toString()} contentContainerStyle={{ paddingBottom: 20 }} />
      <TouchableOpacity style={{ position: 'absolute', bottom: 20, right: 20 }} onPress={() => setModalVisible(!isModalVisible)}>
        <Icon name="add-circle" size={50} color="#007bff" />
      </TouchableOpacity>
      <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10 }} onPress={() => setModalVisible(false)}>
            <Icon name="close-circle" size={30} color="#ff4d4d" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Adicionar Produto</Text>
          <TextInput style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 }} value={newItem.name} onChangeText={(text) => setNewItem({ ...newItem, name: text })} placeholder="Nome" />
          <TextInput style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 }} value={newItem.description} onChangeText={(text) => setNewItem({ ...newItem, description: text })} placeholder="Descrição" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TextInput style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginRight: 5 }} value={newItem.quantity} keyboardType="numeric" onChangeText={(text) => setNewItem({ ...newItem, quantity: text.replace(/\D/g, '') })} placeholder="Quantidade" />
            <TextInput style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginLeft: 5 }} value={newItem.price} keyboardType="numeric" onChangeText={(text) => setNewItem({ ...newItem, price: formatCurrency(text) })} placeholder="Preço (R$)" />
          </View>
          <TouchableOpacity onPress={selectImage} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
            <Icon name="image" size={30} color="#007bff" />
            <Text style={{ color: '#007bff', marginLeft: 10 }}>Selecionar Imagem</Text>
          </TouchableOpacity>
          {newItem.image ? (
            <Image source={{ uri: newItem.image }} style={{ width: 100, height: 100, borderRadius: 10, marginTop: 10 }} />
          ) : null}
          <Picker selectedValue={newItem.type} onValueChange={(value) => setNewItem({ ...newItem, type: value })}>
            <Picker.Item label="Frios" value="frios" />
            <Picker.Item label="Laticínios" value="laticínios" />
            <Picker.Item label="Não Perecíveis" value="não perecíveis" />
            <Picker.Item label="Bebidas" value="bebidas" />
            <Picker.Item label="Outros" value="outros" />
          </Picker>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Button title="Adicionar" onPress={handleCreateItem} />
            <Button title="Limpar" color="#ff4d4d" onPress={handleClearFields} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;