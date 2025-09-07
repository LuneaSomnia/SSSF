import React from 'react';
import { ShoppingCart, Fish, Plus } from 'lucide-react';
import { SeafoodItem } from './CatalogPage';

interface ItemCardProps {
  item: SeafoodItem;
  onPlaceOrder: (item: SeafoodItem) => void;
  onQuickAdd: (item: SeafoodItem) => void;
  showCategory?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onPlaceOrder, onQuickAdd, showCategory = false }) => {
  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd(item);
  };

  return (
    <div className="bg-white/15 backdrop-blur-lg rounded-lg p-3 border border-white/25 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      {/* Image or Icon */}
      {item.image ? (
        <div className="relative h-24 mb-2 rounded-md overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : (
        <div className="h-24 mb-2 rounded-md bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center">
          <Fish className="h-8 w-8 text-white" />
        </div>
      )}

      {/* Item Details */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-white drop-shadow"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
          {item.name}
        </h3>
        
        {/* Category Display for Search Results */}
        {showCategory && (
          <p className="text-xs text-orange-300 font-medium drop-shadow"
             style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            {item.categoryDisplay}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/80"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            {item.quantity}
          </span>
          <span className="text-sm font-bold text-orange-300"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            KSh {item.price.toLocaleString()}
          </span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onPlaceOrder(item)}
            className="flex-1 bg-gradient-to-r from-blue-500/80 to-orange-500/80 backdrop-blur-sm text-white py-2 px-2 rounded-md font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-1 transform hover:scale-105 border border-white/20 text-xs"
          >
            <ShoppingCart className="h-3 w-3" />
            <span>Order</span>
          </button>
          <button
            onClick={handleQuickAddClick}
            className="bg-green-500/80 backdrop-blur-sm text-white py-2 px-2 rounded-md font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 border border-white/20"
            title="Add to cart with options"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;