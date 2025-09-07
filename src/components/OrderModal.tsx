import React, { useState } from 'react';
import { X, Package, Fish, User, MapPin, Phone, Check, AlertCircle, Clock, CreditCard, ChevronUp, ChevronDown, ShoppingCart } from 'lucide-react';
import { SeafoodItem } from './CatalogPage';
import { useCart } from './CartProvider';
import { sendOwnerNotification, createOrderDataFromSingle } from '../lib/email';

interface OrderModalProps {
  item: SeafoodItem;
  onClose: () => void;
}

interface CustomerDetails {
  name: string;
  phone: string;
  location: string;
}

const OrderModal: React.FC<OrderModalProps> = ({ item, onClose }) => {
  const [step, setStep] = useState<'quantity' | 'details' | 'delivery' | 'payment-method' | 'confirmation' | 'complete'>('quantity');
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    location: ''
  });
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [deliveryOption, setDeliveryOption] = useState<'cleaned' | 'asis' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cash' | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { addToCart } = useCart();

  const basePrice = item.price * selectedQuantity;
  const cleaningFee = deliveryOption === 'cleaned' ? item.cleaningFee : 0;
  const finalPrice = basePrice + cleaningFee;

  const handleAddToCart = () => {
    if (deliveryOption) {
      addToCart(item, selectedQuantity, deliveryOption);
      onClose();
    }
  };

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

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerDetails.name && customerDetails.phone && customerDetails.location) {
      setStep('delivery');
    }
  };

  const handleDeliveryOptionSelect = (option: 'cleaned' | 'asis') => {
    setDeliveryOption(option);
    setStep('payment-method');
  };

  const handlePaymentMethodSelect = (method: 'mpesa' | 'cash') => {
    setPaymentMethod(method);
    setStep('confirmation');
  };

  const handleConfirmOrder = () => {
    // Generate order ID
    const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setOrderId(newOrderId);
    
    // Send email notification to owner
    const orderData = createOrderDataFromSingle(
      newOrderId,
      customerDetails.name,
      customerDetails.phone,
      customerDetails.location,
      item,
      selectedQuantity,
      deliveryOption!,
      paymentMethod!
    );

    console.log('Confirming single order:', orderData);

    // Send email notification
    sendOwnerNotification(orderData)
      .then(() => {
        console.log('Owner notification email sent successfully');
      })
      .catch((error) => {
        console.error('Failed to send owner notification email:', error);
        // Don't block the user flow, but log the error
        alert('Order confirmed! However, there was an issue sending the notification email. Please contact us directly.');
      });
    
    setStep('complete');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl transform animate-in fade-in zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Order {item.name}</h2>
            <p className="text-sm text-gray-500">{item.categoryDisplay}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Quantity Selection Step */}
          {step === 'quantity' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select Quantity</h3>
                <p className="text-gray-600">Choose how much {item.name} you'd like to order</p>
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

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Total for {selectedQuantity} KG</p>
                  <p className="text-2xl font-bold text-cyan-600">KSh {basePrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-blue-700 text-sm text-center">
                  <strong>Note:</strong> Use the buttons to adjust quantity in 0.5 KG increments
                </p>
              </div>

              <button
                onClick={() => setStep('details')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue with {selectedQuantity} KG
              </button>
            </div>
          )}

          {/* Customer Details Step */}
          {step === 'details' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Details</h3>
                <p className="text-gray-600">We need your information to process the order</p>
              </div>

              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="0700000000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Location</label>
                  <input
                    type="text"
                    value={customerDetails.location}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your delivery address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Continue
                </button>
              </form>
            </div>
          )}

          {/* Delivery Options Step */}
          {step === 'delivery' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Delivery Options</h3>
                <p className="text-gray-600">How would you like your {item.name} prepared?</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleDeliveryOptionSelect('cleaned')}
                  className={`w-full p-4 border-2 border-gray-200 rounded-2xl hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-300 text-left ${(item.category === 'other' && !['kalamari', 'octopus'].includes(item.id)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={item.category === 'other' && !['kalamari', 'octopus'].includes(item.id)}
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
                    <Package className={`h-6 w-6 ${(item.category === 'other' && !['kalamari', 'octopus'].includes(item.id)) ? 'text-gray-400' : 'text-cyan-600'}`} />
                  </div>
                </button>

                <button
                  onClick={() => handleDeliveryOptionSelect('asis')}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-300 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">As Is</h4>
                      <p className="text-gray-600 text-sm">Fresh catch, you prepare at home</p>
                      <p className="text-green-600 font-semibold">No additional fees</p>
                    </div>
                    <Fish className="h-6 w-6 text-green-600" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Payment Method Step */}
          {step === 'payment-method' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Method</h3>
                <p className="text-gray-600">Choose how you'd like to pay for your order</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handlePaymentMethodSelect('mpesa')}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">M-Pesa Payment</h4>
                      <p className="text-gray-600 text-sm">Pay to M-Pesa Till Number: 6030812</p>
                      <p className="text-green-600 font-semibold">Payment will be verified on delivery</p>
                    </div>
                    <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">M-PESA</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handlePaymentMethodSelect('cash')}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">Cash on Delivery</h4>
                      <p className="text-gray-600 text-sm">Pay when your order arrives</p>
                      <p className="text-blue-600 font-semibold">Pay Later</p>
                    </div>
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">CASH</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Order Confirmation Step */}
          {step === 'confirmation' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirm Your Order</h3>
                <p className="text-gray-600">Please review your order details</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-semibold">{item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold text-sm">{item.categoryDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold">{selectedQuantity} KG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price ({selectedQuantity} KG):</span>
                  <span className="font-semibold">KSh {basePrice.toLocaleString()}</span>
                </div>
                {deliveryOption === 'cleaned' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="font-semibold">KSh {item.cleaningFee}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-800 font-semibold">Total:</span>
                  <span className="font-bold text-xl text-cyan-600">KSh {finalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Option:</span>
                  <span className="font-semibold">
                    {deliveryOption === 'cleaned' ? getDeliveryOptionLabel(item.category) : 'As Is'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">
                    {paymentMethod === 'mpesa' ? 'M-Pesa Till: 6030812' : 'Cash on Delivery'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Customer Details</h4>
                <div className="space-y-1 text-blue-700">
                  <p><strong>Name:</strong> {customerDetails.name}</p>
                  <p><strong>Phone:</strong> {customerDetails.phone}</p>
                  <p><strong>Location:</strong> {customerDetails.location}</p>
                </div>
              </div>

              {paymentMethod === 'mpesa' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <h4 className="font-semibold text-green-800 mb-2">M-Pesa Payment Details</h4>
                  <div className="text-green-700 space-y-1">
                    <p className="text-center"><strong>M-Pesa Till Number: 6030812</strong></p>
                    <p className="text-center"><strong>Amount: KSh {finalPrice.toLocaleString()}</strong></p>
                    <p className="text-sm mt-3 font-semibold text-center">Payment will be verified when your order is delivered.</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleConfirmOrder}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Confirm Order
              </button>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-10 w-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-800 mb-2 mt-4">Order Confirmed!</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for your order! We've received your request and our team has been notified.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                  <p className="text-green-600 font-semibold">Order ID: {orderId}</p>
                </div>

                {paymentMethod === 'mpesa' && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2">M-Pesa Payment Details</h4>
                    <div className="text-green-700 space-y-1">
                      <p><strong>Till Number:</strong> 6030812</p>
                      <p><strong>Amount:</strong> KSh {finalPrice.toLocaleString()}</p>
                      <p className="text-sm">Payment will be verified on delivery</p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
                  <p className="text-blue-600 font-semibold">Our team will confirm delivery time via WhatsApp shortly</p>
                </div>

                <p className="text-sm text-gray-500">
                  Thank you for choosing SeasideSeafood! 🐟
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal;