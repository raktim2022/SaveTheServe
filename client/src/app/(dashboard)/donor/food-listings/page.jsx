'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import FoodForm from '@/components/donor/FoodForm';
import InventoryTable from '@/components/donor/InventoryTable';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import {
  getFoodByRestaurant,
  createFood,
  updateFood,
  deleteFood,
} from '@/services/food.service';

export default function FoodListingsPage() {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await getFoodByRestaurant(user.restaurantId);
      setFoods(response.data || response);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFood(null);
    setShowModal(true);
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingFood) {
        await updateFood(editingFood.id, formData);
      } else {
        await createFood(formData);
      }
      setShowModal(false);
      setEditingFood(null);
      fetchFoods();
      alert('Food listing saved successfully!');
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Failed to save food listing');
    }
  };

  const handleDelete = async (foodId) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await deleteFood(foodId);
      fetchFoods();
      alert('Food listing deleted successfully');
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Failed to delete food listing');
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading food listings..." />;
  }

  return (
    <div>
      <div className="dashboard-header flex items-center justify-between">
        <div>
          <h1 className="dashboard-title">Food Listings</h1>
          <p className="text-gray-600">Manage your food inventory</p>
        </div>
        <Button onClick={handleCreate}>Add New Listing</Button>
      </div>

      <InventoryTable foods={foods} onEdit={handleEdit} onDelete={handleDelete} />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFood ? 'Edit Food Listing' : 'Create Food Listing'}
      >
        <FoodForm
          initialData={editingFood}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}

