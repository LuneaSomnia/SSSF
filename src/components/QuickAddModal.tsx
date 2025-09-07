import React, { useState } from 'react';
import { X, Package, ChevronUp, ChevronDown, ShoppingCart } from 'lucide-react';
import { SeafoodItem } from './CatalogPage';
import { useCart } from './CartProvider';

interface QuickAddModalProps {
  item: SeafoodItem;
  onClose: () => void;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ item, onClose }) => {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [deliveryOption, setDeliveryOption] = useState<'cleaned' | 'asis' | null>(null);
  const { addToCart } = useCart();

  const handleQuantityChange = (direction: 'up' | 'down') => {
    if (direction === 'up' && selectedQuantity < 300) {
      setSelectedQuantity(prev => prev + 0.5);
    } else if (direction === 'down' && selectedQuantity > 0.5) {
      setSelectedQuantity(prev => prev - 0.5);
    }
  };

  const getDeliveryOptionLabel = (category: string) => {
    if (category === 'fish') return 'Fillet & Gutted';
    if (category === 'whole-fish') return 'Cleaned & Descaled';
    if (category === 'prawns') return 'Deveined & Peeled';
    if (category === 'other' && ['kalamari', 'octopus'].includes(item.id)) return 'Cleaned';
    return 'Cleaned';
  };

  const handleAddToCart = () => {
    if (deliveryOption) {
      addToCart(item, selectedQuantity, deliveryOption);
      onClose();
    }
  };

  const basePrice = item.price * selectedQuantity;
  const cleaningFee = deliveryOption === 'cleaned' ? item.cleaningFee : 0;
  const finalPrice = basePrice + cleaningFee;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add to Cart</h2>
            <p className="text-sm text-gray-500">{item.name} - {item.categoryDisplay}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quantity Selection */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Select Quantity & Options</h3>
            <p className="text-gray-600">Choose quantity and how you'd like it prepared</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">Base price per KG</p>
              <p className="text-2xl font-bold text-gray-800">KSh {item.price.toLocaleString()}</p>
            </div>

            <div className="mb-6 space-y-4">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Select Quantity (KG)
              </label>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => handleQuantityChange('down')}
                  disabled={selectedQuantity <= 0.5}
                  className="w-12 h-12 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronDown className="h-6 w-6" />
                </button>
                
                <div className="bg-white border-2 border-cyan-500 rounded-xl px-6 py-4 min-w-[120px]">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{selectedQuantity}</div>
                    <div className="text-sm text-gray-600">KG</div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleQuantityChange('up')}
                  disabled={selectedQuantity >= 300}
                  className="w-12 h-12 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronUp className="h-6 w-6" />
                </button>
              </div>
              
              <div className="text-center text-xs text-gray-500">
                Tap buttons to adjust by 0.5 KG increments
              </div>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 text-center">Choose Preparation</h4>
            
            <button
              onClick={() => setDeliveryOption('cleaned')}
              disabled={item.category === 'other' && !['kalamari', 'octopus'].includes(item.id)}
              className={`w-full p-4 border-2 rounded-2xl transition-all duration-300 text-left ${
                deliveryOption === 'cleaned' 
                  ? 'border-cyan-500 bg-cyan-50' 
                  : 'border-gray-200 hover:border-cyan-500 hover:bg-cyan-50'
              } ${(item.category === 'other' && !['kalamari', 'octopus'].includes(item.id)) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">{getDeliveryOptionLabel(item.category)}</h4>
                  <p className="text-gray-600 text-sm">
                    {item.category === 'fish' && 'Professional filleting and gutting'}
                    {item.category === 'whole-fish' && 'Cleaned and descaled, ready to cook'}
                    {item.category === 'prawns' && 'Deveined and peeled, ready to cook'}
                    {item.category === 'other' && ['kalamari', 'octopus'].includes(item.id) && 'Professionally cleaned'}
                    {item.category === 'other' && !['kalamari', 'octopus'].includes(item.id) && 'Not available for this item'}
                  </p>
                  {(item.category !== 'other' || ['kalamari', 'octopus'].includes(item.id)) && (
                    <p className="text-cyan-600 font-semibold">+KSh {item.cleaningFee} processing fee</p>
                  )}
                </div>
                <Package className={`h-6 w-6 ${
                  deliveryOption === 'cleaned' ? 'text-cyan-600' : 
                  (item.category === 'other' && !['kalamari', 'octopus'].includes(item.id)) ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
            </button>

            <button
              onClick={() => setDeliveryOption('asis')}
              className={`w-full p-4 border-2 rounded-2xl transition-all duration-300 text-left ${
                deliveryOption === 'asis' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">As Is</h4>
                  <p className="text-gray-600 text-sm">Fresh catch, you prepare at home</p>
                  <p className="text-green-600 font-semibold">No additional fees</p>
                </div>
                <ShoppingCart className={`h-6 w-6 ${deliveryOption === 'asis' ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
            </button>
          </div>

          {/* Price Summary */}
          {deliveryOption && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price ({selectedQuantity} KG):</span>
                  <span className="font-semibold">KSh {basePrice.toLocaleString()}</span>
                </div>
                {deliveryOption === 'cleaned' && cleaningFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="font-semibold">KSh {cleaningFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-gray-800">Total:</span>
                  <span className="font-bold text-xl text-cyan-600">KSh {finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!deliveryOption}
            className={`w-full py-3 px-4 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
              deliveryOption
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {deliveryOption ? 'Add to Cart' : 'Select preparation option'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;