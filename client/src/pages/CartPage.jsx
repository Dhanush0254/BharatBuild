import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, updateCartItem, removeCartItem, clearCart, setDeliveryMethod } from '../api/cartApi';
import { createOrder } from '../api/ordersApi';
import toast from 'react-hot-toast';
import { useState } from 'react';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft, IndianRupee,
  Truck, Package, MapPin, ShieldCheck, Store, ArrowRight, CheckCircle
} from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deliveryAddr, setDeliveryAddr] = useState({ area: '', street: '', pincode: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['cart'], queryFn: getCart });
  const cart = data?.cart;

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId) => removeCartItem(itemId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cart'] }); toast.success('Item removed'); },
  });

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cart'] }); toast.success('Cart cleared'); },
  });

  const deliveryMutation = useMutation({
    mutationFn: (method) => setDeliveryMethod(method),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const orderMutation = useMutation({
    mutationFn: (data) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setOrderPlaced(true);
      toast.success('Order placed successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Order failed'),
  });

  const handleCheckout = () => {
    orderMutation.mutate({
      deliveryMethod: cart?.deliveryMethod || 'self_pickup',
      deliveryAddress: deliveryAddr,
    });
  };

  if (orderPlaced) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center bg-white rounded-3xl p-12 shadow-xl border border-slate-100 max-w-md">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Order Placed!</h2>
        <p className="text-slate-500 mb-8">Your order has been sent to the shop. They'll confirm shortly.</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/dashboard/seeker')} className="btn-primary py-3 justify-center">View My Orders</button>
          <button onClick={() => navigate('/materials')} className="btn-secondary py-3 justify-center">Continue Shopping</button>
        </div>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const items = cart?.items || [];
  const estimatedTotal = items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);

  if (items.length === 0) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <ShoppingCart size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-500">Your cart is empty</h2>
        <p className="text-slate-400 mt-2 mb-6">Browse construction materials and add items</p>
        <button onClick={() => navigate('/materials')} className="btn-primary">Browse Materials</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-black text-slate-800">Shopping Cart</h1>
          <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">{items.length} items</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center text-2xl shrink-0">📦</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate cursor-pointer hover:text-amber-600"
                    onClick={() => navigate(`/materials/${item.product?._id}`)}>
                    {item.product?.title || 'Product'}
                  </h3>
                  {item.product?.shop && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Store size={10} /> {item.product.shop.name}
                    </p>
                  )}
                  <p className="text-amber-600 font-bold mt-1">₹{item.priceAtAdd?.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ {item.unit}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200">
                    <button onClick={() => updateMutation.mutate({ itemId: item._id, quantity: item.quantity - 1 })}
                      className="p-2 hover:bg-slate-100 rounded-l-xl"><Minus size={14} /></button>
                    <span className="text-sm font-bold px-3">{item.quantity}</span>
                    <button onClick={() => updateMutation.mutate({ itemId: item._id, quantity: item.quantity + 1 })}
                      className="p-2 hover:bg-slate-100 rounded-r-xl"><Plus size={14} /></button>
                  </div>
                  <p className="font-black text-slate-800 min-w-[80px] text-right">₹{(item.priceAtAdd * item.quantity).toLocaleString()}</p>
                  <button onClick={() => removeMutation.mutate(item._id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            <button onClick={() => clearMutation.mutate()} className="text-sm text-red-500 font-medium hover:underline">Clear Cart</button>
          </div>

          {/* Checkout Panel */}
          <div className="space-y-6">
            {/* Delivery Method */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4">Delivery Method</h3>
              <div className="space-y-3">
                {[
                  { id: 'self_pickup', label: 'Self Pickup', icon: <Package size={18} />, desc: 'Pick up from shop', extra: 'FREE' },
                  { id: 'shop_delivery', label: 'Shop Delivery', icon: <Truck size={18} />, desc: 'Shop delivers to you (Distance based)', extra: 'Est. ~5%' },
                  { id: 'bharatbuild_delivery', label: 'BharatBuild Delivery', icon: <Truck size={18} />, desc: 'Our transport network', extra: 'Live Tracking' },
                ].map(method => (
                  <button key={method.id} onClick={() => {
                    if (method.id === 'bharatbuild_delivery') {
                      toast('🏎️ Whoa there, Speed Racer! BharatBuild live truck tracking is still in the garage getting a tune-up! 🛠️ Coming soon!', {
                        icon: '🚧',
                        style: { borderRadius: '10px', background: '#333', color: '#fff' }
                      });
                      return;
                    }
                    deliveryMutation.mutate(method.id);
                  }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      cart?.deliveryMethod === method.id ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className={`p-2 rounded-lg ${cart?.deliveryMethod === method.id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-800">{method.label}</p>
                      <p className="text-xs text-slate-400">{method.desc}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{method.extra}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Address (if delivery) */}
            {cart?.deliveryMethod !== 'self_pickup' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={16} /> Delivery Address</h3>
                <div className="space-y-3">
                  <input placeholder="Area / Locality" value={deliveryAddr.area}
                    onChange={e => setDeliveryAddr(a => ({ ...a, area: e.target.value }))}
                    className="w-full form-input rounded-xl border-slate-200 text-sm" />
                  <input placeholder="Street / Landmark" value={deliveryAddr.street}
                    onChange={e => setDeliveryAddr(a => ({ ...a, street: e.target.value }))}
                    className="w-full form-input rounded-xl border-slate-200 text-sm" />
                  <input placeholder="Pincode" value={deliveryAddr.pincode}
                    onChange={e => setDeliveryAddr(a => ({ ...a, pincode: e.target.value }))}
                    className="w-full form-input rounded-xl border-slate-200 text-sm" />
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Items Total ({items.length})</span>
                  <span className="font-bold">₹{estimatedTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="font-bold">{cart?.deliveryMethod === 'self_pickup' ? 'FREE' : `~₹${Math.round(estimatedTotal * 0.05).toLocaleString()}`}</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between text-lg font-black text-slate-800">
                  <span>Total</span>
                  <span>₹{(estimatedTotal + (cart?.deliveryMethod === 'self_pickup' ? 0 : Math.round(estimatedTotal * 0.05))).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={handleCheckout} disabled={orderMutation.isPending}
                className="w-full btn-primary py-4 mt-6 text-lg justify-center shadow-xl shadow-amber-500/30">
                {orderMutation.isPending ? 'Placing Order...' : <>Place Order <ArrowRight size={18} /></>}
              </button>
              <p className="text-xs text-slate-400 text-center mt-3">Payment on delivery (COD)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
