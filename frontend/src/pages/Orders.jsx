import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pageSize: 10
  });

  // États pour le backend Django
  const [orderStatuses, setOrderStatuses] = useState({
    'pending': { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ClockIcon },
    'confirmed': { label: 'Confirmée', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircleIcon },
    'paid': { label: 'Payée', color: 'bg-green-100 text-green-800 border-green-200', icon: CurrencyDollarIcon },
    'in_delivery': { label: 'En livraison', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: TruckIcon },
    'delivered': { label: 'Livrée', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircleIcon },
    'completed': { label: 'Terminée', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircleIcon },
    'cancelled': { label: 'Annulée', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircleIcon }
  });

  useEffect(() => {
    fetchOrders();
  }, [user, filter, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      let params = {
        page: pagination.page,
        page_size: pagination.pageSize
      };
      
      if (user?.role === 'farmer' || user?.role === 'vendeur') {
        // API pour les agriculteurs
        response = await ordersAPI.getFarmerOrders(user?.id || user?.user_id, params);
      } else {
        // API pour les acheteurs
        response = await ordersAPI.getBuyerOrders(user?.id || user?.user_id, params);
      }
      
      // Gérer la réponse paginée de Django REST Framework
      if (response.data && response.data.results) {
        setOrders(response.data.results);
        setPagination({
          ...pagination,
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous
        });
      } else {
        setOrders(response.data || []);
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Impossible de charger les commandes. Veuillez réessayer.');
      
      // Fallback avec des données mockées pour le développement
      if (process.env.NODE_ENV === 'development') {
        setOrders(getMockOrders());
      }
    } finally {
      setLoading(false);
    }
  };

  const getMockOrders = () => [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      order_number: 'TRB-2024-001',
      status: 'confirmed',
      total_amount: 4500.00,
      created_at: '2024-01-15T10:30:00Z',
      buyer_id: 'user-123',
      farmer_id: 'farmer-456',
      buyer_name: 'John Doe',
      farmer_name: 'Jean Agriculteur',
      delivery_fee: 500,
      commission_fee: 225,
      items: [
        {
          id: 1,
          product_id: 'prod-001',
          name: 'Tomates fraîches',
          price: 1500.00,
          quantity: 2,
          image: '/api/placeholder/100/100',
          farmer_name: 'Jean Agriculteur',
          total: 3000.00
        },
        {
          id: 2,
          product_id: 'prod-002',
          name: 'Oignons',
          price: 750.00,
          quantity: 2,
          image: '/api/placeholder/100/100',
          farmer_name: 'Jean Agriculteur',
          total: 1500.00
        }
      ],
      transactions: [
        {
          id: 'txn-001',
          amount: 4500.00,
          status: 'success',
          payment_method: 'mobile_money',
          created_at: '2024-01-15T10:35:00Z'
        }
      ]
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      order_number: 'TRB-2024-002',
      status: 'in_delivery',
      total_amount: 2400.00,
      created_at: '2024-01-14T14:20:00Z',
      buyer_id: 'user-123',
      farmer_id: 'farmer-789',
      buyer_name: 'John Doe',
      farmer_name: 'Marie Fermière',
      delivery_fee: 500,
      commission_fee: 120,
      items: [
        {
          id: 3,
          product_id: 'prod-003',
          name: 'Bananes plantains',
          price: 800.00,
          quantity: 3,
          image: '/api/placeholder/100/100',
          farmer_name: 'Marie Fermière',
          total: 2400.00
        }
      ],
      transactions: []
    }
  ];

  const handleConfirmOrder = async (orderId) => {
    try {
      // API pour confirmer une commande
      await ordersAPI.updateOrderStatus(orderId, { status: 'confirmed' });
      fetchOrders(); // Rafraîchir la liste
      
      // Optionnel: Afficher une notification de succès
      alert('Commande confirmée avec succès!');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Erreur lors de la confirmation de la commande.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Veuillez indiquer la raison de l\'annulation:');
    if (!reason) return;
    
    try {
      await ordersAPI.cancelOrder(orderId, { cancellation_reason: reason });
      fetchOrders();
      alert('Commande annulée avec succès!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Erreur lors de l\'annulation de la commande.');
    }
  };

  const handleProcessPayment = async (orderId) => {
    const paymentData = {
      amount: 0, // Le montant sera calculé automatiquement
      payment_method: 'mobile_money',
      payer_id: user?.id,
      payee_id: '', // À déterminer selon la logique métier
      metadata: {}
    };
    
    try {
      await ordersAPI.processPayment(orderId, paymentData);
      fetchOrders();
      alert('Paiement traité avec succès!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Erreur lors du traitement du paiement.');
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, { status: 'delivered' });
      fetchOrders();
      alert('Commande marquée comme livrée!');
    } catch (error) {
      console.error('Error marking as delivered:', error);
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  const handleMarkAsCompleted = async (orderId) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, { status: 'completed' });
      fetchOrders();
      alert('Commande marquée comme terminée!');
    } catch (error) {
      console.error('Error marking as completed:', error);
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  const getTotalPages = () => {
    return Math.ceil(pagination.count / pagination.pageSize);
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusIcon = (status) => {
    const Icon = orderStatuses[status]?.icon || ClockIcon;
    return <Icon className="h-5 w-5" />;
  };

  const getStatusText = (status) => {
    return orderStatuses[status]?.label || status;
  };

  const getStatusColor = (status) => {
    return orderStatuses[status]?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const renderActionButtons = (order) => {
    const isBuyer = !(user?.role === 'farmer' || user?.role === 'vendeur');
    
    if (isBuyer) {
      switch (order.status) {
        case 'confirmed':
          return (
            <button
              onClick={() => handleProcessPayment(order.id)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Payer maintenant
            </button>
          );
        case 'delivered':
          return (
            <button
              onClick={() => handleMarkAsCompleted(order.id)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              Confirmer réception
            </button>
          );
        default:
          return null;
      }
    } else {
      // Actions pour l'agriculteur
      switch (order.status) {
        case 'pending':
          return (
            <div className="flex space-x-2">
              <button
                onClick={() => handleConfirmOrder(order.id)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Confirmer
              </button>
              <button
                onClick={() => handleCancelOrder(order.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Refuser
              </button>
            </div>
          );
        case 'paid':
          return (
            <button
              onClick={() => navigate(`/orders/${order.id}/ship`)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Préparer l'expédition
            </button>
          );
        case 'in_delivery':
          return (
            <button
              onClick={() => handleMarkAsDelivered(order.id)}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
            >
              Marquer comme livrée
            </button>
          );
        default:
          return null;
      }
    }
  };

  const renderOrderDetails = (order) => {
    const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const deliveryFee = order.delivery_fee || 0;
    const commission = order.commission_fee || 0;
    const total = order.total_amount || subtotal + deliveryFee + commission;

    return (
      <div className="space-y-4">
        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Informations de commande</h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Numéro:</span> {order.order_number}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span> {formatDate(order.created_at)}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Informations {user?.role === 'farmer' ? 'd\'acheteur' : 'd\'agriculteur'}</h4>
            <p className="text-sm text-gray-600 flex items-center">
              <UserIcon className="h-4 w-4 mr-2" />
              {user?.role === 'farmer' ? order.buyer_name : order.farmer_name}
            </p>
          </div>
        </div>

        {/* Détails des articles */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700">Articles commandés</h4>
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-3 bg-white border border-gray-200 rounded-lg">
              <img
                src={item.image || '/api/placeholder/100/100'}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{item.name}</h5>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Quantité: {item.quantity}</span>
                  <span>Prix unitaire: {formatCurrency(item.price)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Récapitulatif des coûts */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-gray-700 mb-2">Récapitulatif</h4>
          <div className="flex justify-between text-sm">
            <span>Sous-total:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Frais de livraison:</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Commission platform:</span>
            <span>{formatCurrency(commission)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t border-gray-300 pt-2 mt-2">
            <span>Total:</span>
            <span className="text-green-600">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Informations de paiement */}
        {order.transactions?.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Informations de paiement
            </h4>
            {order.transactions.map((transaction) => (
              <div key={transaction.id} className="text-sm text-blue-600">
                <p>Transaction: {transaction.id}</p>
                <p>Statut: {transaction.status}</p>
                <p>Méthode: {transaction.payment_method}</p>
                <p>Date: {formatDate(transaction.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.role === 'farmer' || user?.role === 'vendeur' 
                  ? 'Commandes de ma ferme' 
                  : 'Mes commandes'
                }
              </h1>
              <p className="text-gray-600">
                {user?.role === 'farmer' || user?.role === 'vendeur'
                  ? 'Suivez les commandes de vos produits' 
                  : 'Suivez l\'état de vos commandes et vos achats précédents'
                }
              </p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                <span>{error}</span>
                <button 
                  onClick={fetchOrders}
                  className="ml-4 text-red-700 hover:text-red-900"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', ...Object.keys(orderStatuses)].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setPagination({ ...pagination, page: 1 });
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  filter === status
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? (
                  <>
                    <ShoppingBagIcon className="h-4 w-4 mr-2" />
                    Toutes
                  </>
                ) : (
                  <>
                    {getStatusIcon(status)}
                    <span className="ml-2">{getStatusText(status)}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{pagination.count}</div>
            <div className="text-sm text-gray-600">Total commandes</div>
          </div>
          {Object.keys(orderStatuses).map((status) => {
            const count = orders.filter(o => o.status === status).length;
            if (count === 0) return null;
            
            return (
              <div key={status} className={`rounded-2xl p-4 shadow-sm border ${getStatusColor(status)}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm">{getStatusText(status)}</div>
              </div>
            );
          })}
        </div>

        {/* Liste des commandes */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune commande</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "Vous n'avez pas encore de commande."
                  : `Aucune commande avec le statut "${getStatusText(filter)}".`
                }
              </p>
              {!(user?.role === 'farmer' || user?.role === 'vendeur') && (
                <Link
                  to="/marketplace"
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center"
                >
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  Découvrir nos produits
                </Link>
              )}
            </div>
          ) : (
            <>
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* En-tête de la commande */}
                  <div className="border-b border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {order.order_number || `Commande #${order.id}`}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            Passée le {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} article{order.items?.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contenu de la commande */}
                  <div className="p-6">
                    {renderOrderDetails(order)}
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="text-sm text-gray-600">
                        {user?.role === 'farmer' || user?.role === 'vendeur'
                          ? `Acheteur: ${order.buyer_name || 'Non spécifié'}`
                          : `Agriculteur: ${order.farmer_name || 'Non spécifié'}`
                        }
                      </div>
                      <div className="flex space-x-3">
                        <Link
                          to={`/orders/${order.id}`}
                          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Voir les détails
                        </Link>
                        {renderActionButtons(order)}
                        {order.status === 'cancelled' && order.cancellation_reason && (
                          <button
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            title={`Raison: ${order.cancellation_reason}`}
                          >
                            <ExclamationTriangleIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {getTotalPages() > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.previous}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      pagination.previous
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Précédent
                  </button>
                  
                  <span className="text-gray-600">
                    Page {pagination.page} sur {getTotalPages()}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.next}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      pagination.next
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;