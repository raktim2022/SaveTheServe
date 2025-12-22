'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Package, Edit2, Trash2, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import FoodForm from '@/components/donor/FoodForm';
import InventoryTable from '@/components/donor/InventoryTable';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import {
  getFoodByRestaurant,
  createFood,
  updateFood,
  deleteFood,
} from '@/services/food.service';
import { formatDate } from '@/utils/formatDate';

export default function FoodListingsPage() {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    filterFoods();
  }, [foods, searchQuery, statusFilter]);

  const filterFoods = () => {
    let filtered = foods;
    
    if (searchQuery) {
      filtered = filtered.filter(food => 
        food.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(food => 
        food.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    setFilteredFoods(filtered);
  };

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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'PICKED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpiringSoon = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffHours = (expiry - now) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  };

  if (loading) {
    return <Loader fullScreen text="Loading food listings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Listings</h1>
          <p className="text-gray-600 mt-1">Manage your food inventory and donations</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add New Listing
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className="glass-card p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="claimed">Claimed</option>
              <option value="REQUESTED">Requested</option>
              <option value="PICKED">Picked</option>
            </select>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              {filteredFoods.length} of {foods.length} items
            </span>
          </div>
        </div>
      </motion.div>

      {/* Food Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {filteredFoods.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No food listings found</h3>
            <p className="text-gray-600 mb-4">
              {foods.length === 0 
                ? 'Get started by creating your first food listing.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {foods.length === 0 && (
              <Button onClick={handleCreate}>Create Your First Listing</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map((food, index) => (
              <motion.div
                key={food.id}
                className="glass-card rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {food.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {food.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isExpiringSoon(food.expiresAt) && (
                        <AlertCircle className="h-5 w-5 text-yellow-500" title="Expiring soon" />
                      )}
                      <Badge className={getStatusColor(food.status)}>
                        {food.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {food.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-medium">{food.quantity} portions</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Expires:</span>
                      <span className={`font-medium ${isExpiringSoon(food.expiresAt) ? 'text-yellow-600' : ''}`}>
                        {formatDate(food.expiresAt)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">{formatDate(food.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(food)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(food.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Food Form Modal */}
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

