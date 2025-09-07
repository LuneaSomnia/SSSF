import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import HomePage from './HomePage';
import CatalogPage from './CatalogPage';
import CartModal from './CartModal';
import CartProvider, { useCart } from './CartProvider';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'catalog'>('home');
  const [showCart, setShowCart] = useState(false);
  const { getTotalItems } = useCart();

  const navigateToHome = () => setCurrentPage('home');
  const navigateToCatalog = () => setCurrentPage('catalog');

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center">
        <button
          onClick={navigateToHome}
          className="bg-white/15 backdrop-blur-lg border border-white/25 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:bg-white/25 transition-all duration-300 transform hover:scale-105"
        >
          Home
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={navigateToCatalog}
            className="bg-white/15 backdrop-blur-lg border border-white/25 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:bg-white/25 transition-all duration-300 transform hover:scale-105"
          >
            Catalogue
          </button>
          
          <button
            onClick={() => setShowCart(true)}
            className="bg-white/15 backdrop-blur-lg border border-white/25 text-white px-4 py-3 rounded-2xl font-semibold shadow-xl hover:bg-white/25 transition-all duration-300 transform hover:scale-105 relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {getTotalItems() > 0 && (
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {getTotalItems()}
              </div>
            )}
          </button>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'home' && <HomePage onNavigateToCatalog={navigateToCatalog} />}
      {currentPage === 'catalog' && <CatalogPage />}

      {/* Cart Modal */}
      {showCart && <CartModal onClose={() => setShowCart(false)} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
};

export default App;