import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { TruckIcon, ShoppingBagIcon, CurrencyDollarIcon, StarIcon, MapIcon, ClockIcon } from '@heroicons/react/24/outline';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Données de démonstration
  const driverStats = [
    { 
      name: 'Livraisons ce mois', 
      value: '45', 
      icon: TruckIcon, 
      color: 'green'
    },
    { 
      name: 'En cours', 
      value: '3', 
      icon: ShoppingBagIcon, 
      color: 'blue'
    },
    { 
      name: 'Revenus totaux', 
      value: '280 000 FCFA', 
      icon: CurrencyDollarIcon, 
      color: 'emerald'
    },
    { 
      name: 'Satisfaction', 
      value: '4.9/5', 
      icon: StarIcon, 
      color: 'yellow'
    },
  ];

  const upcomingDeliveries = [
    { id: 1, client: 'Alice Martin', address: 'Douala, Bonamoussadi', time: '14:00', products: ['Tomates', 'Oignons'] },
    { id: 2, client: 'Paul Dubois', address: 'Yaoundé, Bastos', time: '16:30', products: ['Bananes', 'Manioc'] },
    { id: 3, client: 'Sophie Ngo', address: 'Douala, Akwa', time: '18:00', products: ['Légumes variés'] },
  ];

  const quickActions = [
    { 
      name: 'Nouvelles livraisons', 
      href: '/driver/deliveries', 
      icon: TruckIcon,
      description: 'Prendre en charge de nouvelles livraisons',
      color: 'green'
    },
    { 
      name: 'Mon planning', 
      href: '/driver/schedule', 
      icon: ClockIcon,
      description: 'Gérer mon emploi du temps',
      color: 'blue'
    },
    { 
      name: 'Mes performances', 
      href: '/driver/performance', 
      icon: StarIcon,
      description: 'Voir mes statistiques de livraison',
      color: 'yellow'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-2xl text-white">🚚</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Bonjour, <span className="text-green-600">{user?.name || user?.username}</span>
          </h1>
          <p className="text-xl text-gray-600">Bienvenue sur votre tableau de bord livreur</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {driverStats.map((item, index) => (
            <div
              key={item.name}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-white/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-2xl ${
                    item.color === 'green' ? 'bg-green-100' :
                    item.color === 'blue' ? 'bg-blue-100' :
                    item.color === 'emerald' ? 'bg-emerald-100' :
                    item.color === 'yellow' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <item.icon className={`h-6 w-6 ${
                      item.color === 'green' ? 'text-green-600' :
                      item.color === 'blue' ? 'text-blue-600' :
                      item.color === 'emerald' ? 'text-emerald-600' :
                      item.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'
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
                    action.color === 'green' ? 'bg-green-100' :
                    action.color === 'blue' ? 'bg-blue-100' :
                    action.color === 'yellow' ? 'bg-yellow-100' : 'bg-gray-100'
                  } mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className={`h-6 w-6 ${
                      action.color === 'green' ? 'text-green-600' :
                      action.color === 'blue' ? 'text-blue-600' :
                      action.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'
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

        {/* Livraisons à venir */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900">Livraisons à venir aujourd'hui</h2>
            <Link
              to="/driver/deliveries"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center"
            >
              Voir tout
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow border border-gray-100 transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TruckIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{delivery.client}</h3>
                    <p className="text-sm text-gray-500">{delivery.address}</p>
                    <p className="text-xs text-gray-400">
                      Produits: {delivery.products.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    🕒 {delivery.time}
                  </span>
                  <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-300">
                    Démarrer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;