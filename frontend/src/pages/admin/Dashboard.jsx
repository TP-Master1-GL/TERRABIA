import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { UserGroupIcon, ShoppingBagIcon, CurrencyDollarIcon, ChartBarIcon, UsersIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();

  const adminStats = [
    { 
      name: 'Utilisateurs totaux', 
      value: '156', 
      icon: UserGroupIcon, 
      change: '+12',
      color: 'blue'
    },
    { 
      name: 'Commandes aujourd\'hui', 
      value: '42', 
      icon: ShoppingBagIcon, 
      change: '+5',
      color: 'green'
    },
    { 
      name: 'Revenus totaux', 
      value: '2.5M FCFA', 
      icon: CurrencyDollarIcon, 
      change: '+15%',
      color: 'emerald'
    },
    { 
      name: 'Satisfaction', 
      value: '4.7/5', 
      icon: ChartBarIcon, 
      change: '+0.2',
      color: 'yellow'
    },
  ];

  const quickActions = [
    { 
      name: 'Gérer les utilisateurs', 
      href: '/admin/users', 
      icon: UsersIcon,
      description: 'Gérer les comptes utilisateurs et permissions',
      color: 'blue'
    },
    { 
      name: 'Voir les statistiques', 
      href: '/admin/analytics', 
      icon: ChartBarIcon,
      description: 'Analyses détaillées de la plateforme',
      color: 'green'
    },
    { 
      name: 'Paramètres système', 
      href: '/admin/settings', 
      icon: ShieldCheckIcon,
      description: 'Configurer les paramètres de la plateforme',
      color: 'purple'
    },
  ];

  const recentActivity = [
    { id: 1, user: 'Nouvel agriculteur', action: 'a rejoint la plateforme', time: '10 min' },
    { id: 2, user: 'Commande #4567', action: 'a été livrée avec succès', time: '1 heure' },
    { id: 3, user: 'Paiement', action: 'réussi pour 75 000 FCFA', time: '2 heures' },
    { id: 4, user: 'Nouveau produit', action: 'ajouté par "Ferme Bio"', time: '3 heures' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-2xl text-white">👑</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Bonjour, <span className="text-purple-600">{user?.name || 'Administrateur'}</span>
          </h1>
          <p className="text-xl text-gray-600">Tableau de bord d'administration</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {adminStats.map((item, index) => (
            <div
              key={item.name}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-white/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-2xl ${
                    item.color === 'blue' ? 'bg-blue-100' :
                    item.color === 'green' ? 'bg-green-100' :
                    item.color === 'emerald' ? 'bg-emerald-100' :
                    item.color === 'yellow' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <item.icon className={`h-6 w-6 ${
                      item.color === 'blue' ? 'text-blue-600' :
                      item.color === 'green' ? 'text-green-600' :
                      item.color === 'emerald' ? 'text-emerald-600' :
                      item.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{item.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-black text-gray-900">{item.value}</p>
                    <span className="ml-2 text-sm font-medium text-green-600">
                      {item.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions administratives</h2>
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
                    action.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
                  } mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className={`h-6 w-6 ${
                      action.color === 'blue' ? 'text-blue-600' :
                      action.color === 'green' ? 'text-green-600' :
                      action.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
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

        {/* Activité récente */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Activité récente</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow border border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;