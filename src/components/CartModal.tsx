import React, { useState } from 'react';
import { X, Trash2, ShoppingCart, User, MapPin, Phone, Check, AlertCircle, CreditCard } from 'lucide-react';
import { useCart, CartItem } from './CartProvider';
import { sendOwnerNotification, createOrderDataFromCart } from '../lib/email';

interface CartModalProps {
  onClose: () => void;
}

interface CustomerDetails {
  name: string;
  phone: string;
  location: string;
}

const formatKES = (amount: number): string => {
  return `KSh ${amount.toLocaleString()}`;
};

const CartModal: React.FC<CartModalProps> = ({ onClose }) => {
  const { items, removeFromCart, clearCart, getTotalPrice } = useCart();
  const [step, setStep] = useState<'cart' | 'details' | 'payment' | 'confirmation' | 'complete'>('cart');
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    location: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cash' | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const getDeliveryOptionLabel = (item: CartItem) => {
    if (item.deliveryOption === 'asis') return 'As Is';
    
    const category = item.item.category;
    if (category === 'fish') return 'Fillet & Gutted';
    if (category === 'whole-fish') return 'Cleaned & Descaled';
    if (category === 'prawns') return 'Deveined & Peeled';
    if (category === 'other' && ['kalamari', 'octopus'].includes(item.item.id)) return 'Cleaned';
    return 'As Is';
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerDetails.name && customerDetails.phone && customerDetails.location) {
      setStep('payment');
    }
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
    const orderData = createOrderDataFromCart(
      newOrderId,
      customerDetails.name,
      customerDetails.phone,
      customerDetails.location,
      items,
      paymentMethod!
    );

    console.log('Confirming cart order:', orderData);

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
    
    // Clear cart and complete order
    clearCart();
    setStep('complete');
  };

  if (items.length === 0 && step === 'cart') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious seafood to get started!</p>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {step === 'cart' && 'Shopping Cart'}
            {step === 'details' && 'Your Details'}
            {step === 'payment' && 'Payment Method'}
            {step === 'confirmation' && 'Confirm Order'}
            {step === 'complete' && 'Order Complete'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Cart Items Step */}
          {step === 'cart' && (
            <div className="space-y-6">
              <div className="space-y-4">
                {items.map((cartItem) => (
                  <div key={cartItem.id} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{cartItem.item.name}</h3>
                        <p className="text-sm text-gray-600">{cartItem.item.categoryDisplay}</p>
                        <p className="text-sm text-gray-600">
                          {cartItem.quantity} KG • {getDeliveryOptionLabel(cartItem)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(cartItem.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Base: {formatKES(cartItem.basePrice)}
                        {cartItem.cleaningFee > 0 && ` + Processing: ${formatKES(cartItem.cleaningFee)}`}
                      </div>
                      <div className="font-bold text-cyan-600">{formatKES(cartItem.totalPrice)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-cyan-600">{formatKES(getTotalPrice())}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setStep('details')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
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
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold"
                >
                  Continue
                </button>
              </form>
            </div>
          )}

          {/* Payment Method Step */}
          {step === 'payment' && (
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

          {/* Confirmation Step */}
          {step === 'confirmation' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirm Your Order</h3>
                <p className="text-gray-600">Please review your cart and details</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-3 max-h-60 overflow-y-auto">
                {items.map((cartItem) => (
                  <div key={cartItem.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                    <div className="flex justify-between">
                      <span className="font-medium">{cartItem.item.name}</span>
                      <span className="font-semibold">{formatKES(cartItem.totalPrice)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {cartItem.quantity} KG • {getDeliveryOptionLabel(cartItem)}
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-800 font-semibold">Total:</span>
                  <span className="font-bold text-xl text-cyan-600">{formatKES(getTotalPrice())}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Customer Details</h4>
                <div className="space-y-1 text-blue-700">
                  <p><strong>Name:</strong> {customerDetails.name}</p>
                  <p><strong>Phone:</strong> {customerDetails.phone}</p>
                  <p><strong>Location:</strong> {customerDetails.location}</p>
                  <p><strong>Payment:</strong> {paymentMethod === 'mpesa' ? 'M-Pesa Till: 6030812' : 'Cash on Delivery'}</p>
                </div>
              </div>

              {paymentMethod === 'mpesa' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <h4 className="font-semibold text-green-800 mb-2">M-Pesa Payment Details</h4>
                  <div className="text-green-700 space-y-1">
                    <p className="text-center"><strong>M-Pesa Till Number: 6030812</strong></p>
                    <p className="text-center"><strong>Amount: {formatKES(getTotalPrice())}</strong></p>
                    <p className="text-sm mt-3 font-semibold text-center">Payment will be verified when your order is delivered.</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleConfirmOrder}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold"
              >
                Confirm Order
              </button>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">Order Confirmed!</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for your bulk order! We've received your request and our team has been notified.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                  <p className="text-green-600 font-semibold">Order ID: {orderId}</p>
                </div>

                {paymentMethod === 'mpesa' && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2">M-Pesa Payment Details</h4>
                    <div className="text-green-700 space-y-1">
                      <p><strong>Till Number:</strong> 6030812</p>
                      <p><strong>Amount:</strong> {formatKES(getTotalPrice())}</p>
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
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold"
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

export default CartModal;