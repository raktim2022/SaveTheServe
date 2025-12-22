'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Heart, Clock, Users, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import FoodCard from '@/components/ngo/FoodCard';
import RequestForm from '@/components/ngo/RequestForm';
import Modal from '@/components/common/Modal';
import Loader from '@/components/common/Loader';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { getFoodListings } from '@/services/food.service';
import { createRequest } from '@/services/request.service';
import { getMyRequests, getRequestStats } from '@/services/request.service';

export default function NGODashboard() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stats, setStats] = useState({
    totalRequests: 0,
    mealsRescued: 0,
    activeDonors: 0,
    impactScore: 0
  });

  // Validate user access to this dashboard
  useEffect(() => {
    if (user && userId) {
      // Check if the user ID matches the logged-in user and user is NGO
      if (user.id.toString() !== userId.toString() || user.role !== 'NGO') {
        router.push('/login');
        return;
      }
    }
  }, [user, userId, router]);

  useEffect(() => {
    fetchFoods();
    fetchRecentRequests();
    fetchStats();
  }, []);

  useEffect(() => {
    filterFoods();
  }, [foods, searchQuery, locationFilter, categoryFilter]);

  const fetchFoods = async () => {
    try {
      const response = await getFoodListings({ status: 'AVAILABLE' });
      const foodsData = response.data || response;
      // Ensure foodsData is an array
      setFoods(Array.isArray(foodsData) ? foodsData : []);
    } catch (error) {
      console.error('Error fetching foods:', error);
      // Set empty array if API fails
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const response = await getMyRequests();
      setRecentRequests((response.data || response).slice(0, 3));
    } catch (error) {
      console.error('Error fetching recent requests:', error);
      // Set empty array if API fails
      setRecentRequests([]);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats - in real app, fetch from API
      setStats({
        totalRequests: 24,
        mealsRescued: 450,
        activeDonors: 8,
        impactScore: 92
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterFoods = () => {
    // Ensure foods is an array before filtering
    if (!Array.isArray(foods)) {
      setFilteredFoods([]);
      return;
    }

    let filtered = foods;
    
    if (searchQuery) {
      filtered = filtered.filter(food => 
        food.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(food => 
        food.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    if (locationFilter) {
      filtered = filtered.filter(food =>
        food.restaurant?.address?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    setFilteredFoods(filtered);
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
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  const statCards = [
    { 
      title: 'Total Requests', 
      value: stats.totalRequests, 
      icon: <Heart className="h-6 w-6" />, 
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    { 
      title: 'Meals Rescued', 
      value: stats.mealsRescued, 
      icon: <Users className="h-6 w-6" />, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Active Donors', 
      value: stats.activeDonors, 
      icon: <TrendingUp className="h-6 w-6" />, 
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50'
    },
    { 
      title: 'Impact Score', 
      value: `${stats.impactScore}%`, 
      icon: <Clock className="h-6 w-6" />, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Let's rescue some food and help our community
          </p>
        </div>
        <Button 
          onClick={() => setShowRequestModal(true)} 
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="glass-card p-6 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className="glass-card p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Available Food</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              <option value="food">Food</option>
              <option value="beverages">Beverages</option>
              <option value="bakery">Bakery</option>
              <option value="produce">Produce</option>
            </select>
          </div>
          <Button variant="outline" onClick={filterFoods}>
            Apply Filters
          </Button>
        </div>
      </motion.div>

      {/* Food Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredFoods.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No food available</h3>
            <p className="text-gray-600">
              {searchQuery || locationFilter || categoryFilter !== 'all' 
                ? 'Try adjusting your filters to find more options.'
                : 'Check back soon for new food donations.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(filteredFoods) ? filteredFoods : []).map((food, index) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
              >
                <FoodCard food={food} onRequest={handleRequest} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Food Pickup"
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

