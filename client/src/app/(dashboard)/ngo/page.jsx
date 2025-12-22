'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import FoodCard from '@/components/ngo/FoodCard';
import RequestForm from '@/components/ngo/RequestForm';
import Modal from '@/components/common/Modal';
import Loader from '@/components/common/Loader';
import { getFoodListings } from '@/services/food.service';
import { createRequest } from '@/services/request.service';

export default function NGODashboard() {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await getFoodListings({ status: 'available' });
      setFoods(response.data || response);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = (food) => {
    setSelectedFood(food);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async (requestData) => {
    try {
      await createRequest(requestData);
      setShowRequestModal(false);
      setSelectedFood(null);
      fetchFoods();
      alert('Request submitted successfully!');
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading available food..." />;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Available Food</h1>
        <p className="text-gray-600">Browse and request available food items</p>
      </div>

      {foods.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No food available at the moment.</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} onRequest={handleRequest} />
          ))}
        </div>
      )}

      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Food"
      >
        {selectedFood && (
          <RequestForm
            food={selectedFood}
            onSubmit={handleSubmitRequest}
            onCancel={() => setShowRequestModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}

