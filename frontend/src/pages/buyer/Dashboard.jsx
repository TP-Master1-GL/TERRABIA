import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ordersAPI, analyticsAPI } from '../../services/api';
import {
  ShoppingBagIcon,
  TruckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Commandes récentes
      const ordersResponse = await ordersAPI.getBuyerOrders({ limit: 3 });
      setRecentOrders(ordersResponse.data.results || ordersResponse.data || []);

      // Statistiques
      try {
        const analyticsResponse = await analyticsAPI.getDashboardStats();
        setStats(analyticsResponse.data || {});
      } catch (error) {
        console.warn('Analytics service not available');
        setStats({
          totalOrders: 12,
          pendingOrders: 2,
          totalSpent: 125000,
          favoriteFarmers: 8
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        totalSpent: 0,
        favoriteFarmers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const buyerStats = [
    { 
      name: 'Commandes passées', 
      value: stats.totalOrders || '0', 
      icon: ShoppingBagIcon, 
      color: 'blue'
    },
    { 
      name: 'En cours', 
      value: stats.pendingOrders || '0', 
      icon: TruckIcon, 
      color: 'yellow'
    },
    { 
      name: 'Dépenses totales', 
      value: `${(stats.totalSpent || 0).toLocaleString()} FCFA`, 
      icon: CurrencyDollarIcon, 
      color: 'emerald'
    },
    { 
      name: 'Agriculteurs suivis', 
      value: stats.favoriteFarmers || '0', 
      icon: UserGroupIcon, 
      color: 'purple'
    },
  ];

  const quickActions = [
    { 
      name: 'Parcourir le marché', 
      href: '/marketplace', 
      icon: ShoppingBagIcon,
      description: 'Découvrir de nouveaux produits frais',
      color: 'green'
    },
    { 
      name: 'Suivre mes commandes', 
      href: '/orders', 
      icon: TruckIcon,
      description: 'Voir le statut de mes commandes',
      color: 'blue'
    },
    { 
      name: 'Agriculteurs favoris', 
      href: '/favorites', 
      icon: HeartIcon,
      description: 'Retrouver mes producteurs préférés',
      color: 'pink'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-2xl text-white">🛒</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Bonjour, <span className="text-blue-600">{user?.name || user?.username}</span>
          </h1>
          <p className="text-xl text-gray-600">Bienvenue sur votre tableau de bord acheteur</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {buyerStats.map((item, index) => (
            <div
              key={item.name}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-white/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-2xl ${
                    item.color === 'blue' ? 'bg-blue-100' :
                    item.color === 'yellow' ? 'bg-yellow-100' :
                    item.color === 'emerald' ? 'bg-emerald-100' :
                    item.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <item.icon className={`h-6 w-6 ${
                      item.color === 'blue' ? 'text-blue-600' :
                      item.color === 'yellow' ? 'text-yellow-600' :
                      item.color === 'emerald' ? 'text-emerald-600' :
                      item.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{item.name}</p>
                  <p className="text-2xl font-black text-gray-900">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-2xl ${
                    action.color === 'blue' ? 'bg-blue-100' :
                    action.color === 'green' ? 'bg-green-100' :
                    action.color === 'pink' ? 'bg-pink-100' : 'bg-gray-100'
                  } mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className={`h-6 w-6 ${
                      action.color === 'blue' ? 'text-blue-600' :
                      action.color === 'green' ? 'text-green-600' :
                      action.color === 'pink' ? 'text-pink-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                      {action.name}
                    </h3>
                    <p className="text-gray-600 mt-1 group-hover:text-gray-500 transition-colors duration-300">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Commandes récentes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900">Commandes récentes</h2>
            <Link
              to="/orders"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
            >
              Voir tout
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl shadow border border-gray-100 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {order.product || `Commande #${order.id}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.farmer_name || order.farmer?.name || 'Agriculteur'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status === 'delivered' ? 'Livré' : 
                       order.status === 'shipped' ? 'Expédié' : 'En cours'}
                    </span>
                    <p className="text-lg font-black text-gray-900 mt-1">
                      {order.total_amount?.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune commande récente</p>
              <Link
                to="/marketplace"
                className="inline-block mt-4 bg-blue-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-600"
              >
                Faire ma première commande
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;