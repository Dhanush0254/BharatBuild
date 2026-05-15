import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById, getShopProducts } from '../api/productsApi';
import { addToCart } from '../api/cartApi';
import { validateProductPrice } from '../api/mlApi';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Star, MapPin, ShieldCheck, Truck, Package, Store, Phone,
  ShoppingCart, Plus, Minus, ArrowLeft, IndianRupee, Clock, ChevronRight
} from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
  });

  const product = data?.product;

  const { data: shopData } = useQuery({
    queryKey: ['shop-products', product?.shop?._id],
    queryFn: () => getShopProducts(product.shop._id, { limit: 4 }),
    enabled: !!product?.shop?._id,
  });

  const { data: validationResult } = useQuery({
    queryKey: ['price-validation', id],
    queryFn: () => validateProductPrice({
      category: 'materials',
      sub_category: product.title,
      proposed_price: product.price,
      unit: product.unit,
      area: product.shop?.address?.area || 'Hyderabad'
    }),
    enabled: !!product?.price,
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); navigate('/login'); return; }
    try {
      await addToCart(product._id, quantity);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Package size={64} className="mx-auto text-slate-300 mb-4" />
        <p className="text-xl font-bold text-slate-500">Product not found</p>
        <button onClick={() => navigate('/materials')} className="btn-primary mt-4">Browse Materials</button>
      </div>
    </div>
  );

  const otherProducts = shopData?.products?.filter(p => p._id !== product._id) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back nav */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm text-slate-500">
            <span className="hover:text-amber-600 cursor-pointer" onClick={() => navigate('/materials')}>Materials</span>
            <ChevronRight size={14} className="inline mx-1" />
            <span className="capitalize">{product.category}</span>
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Product Image & Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              <div className="h-64 md:h-80 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center relative">
                <span className="text-8xl">
                  {{'cement':'🏗️','sand':'⏳','bricks':'🧱','steel':'🔩','tiles':'🔲','paint':'🎨','hardware':'🔧','pipes':'🔌','tools':'🛠️','gravel':'🪨'}[product.category] || '📦'}
                </span>
                {product.isVerified && (
                  <span className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <ShieldCheck size={14} /> Verified Product
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{product.category}</span>
                    <h1 className="text-2xl font-black text-slate-800 mt-1">{product.title}</h1>
                    {product.brand && <p className="text-slate-500 font-medium mt-1">Brand: {product.brand}</p>}
                  </div>
                  {product.ratings?.average > 0 && (
                    <div className="bg-emerald-50 px-3 py-2 rounded-xl text-center shrink-0">
                      <div className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Star size={16} fill="currentColor" /> {product.ratings.average.toFixed(1)}
                      </div>
                      <p className="text-[10px] text-emerald-600">{product.ratings.count} reviews</p>
                    </div>
                  )}
                </div>

                <p className="text-slate-600 mt-4 leading-relaxed">{product.description}</p>

                {/* Specs */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Specifications</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(product.specifications).map(([key, val]) => (
                        <div key={key} className="bg-slate-50 px-3 py-2 rounded-lg">
                          <span className="text-xs text-slate-400 uppercase">{key}</span>
                          <p className="text-sm font-semibold text-slate-700">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {product.tags.map(tag => (
                      <span key={tag} className="bg-slate-100 text-slate-500 text-xs font-medium px-2.5 py-1 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Purchase Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-36">
              <div className="mb-6">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Price</p>
                <div className="flex flex-col mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-800 flex items-center">
                      <IndianRupee size={28} className="text-amber-500" />{product.price?.toLocaleString()}
                    </span>
                    <span className="text-slate-400 font-medium">/ {product.unit}</span>
                  </div>
                  
                  {/* ML Price Validation Badge */}
                  {validationResult && validationResult.status !== 'UNKNOWN' && (
                    <div className={`mt-3 p-3 rounded-xl flex flex-col gap-1 border border-l-4 shadow-sm ${
                      validationResult.status === 'GREAT_DEAL' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' :
                      validationResult.status === 'FAIR' ? 'bg-blue-50 border-blue-500 text-blue-800' :
                      validationResult.status === 'HIGH' ? 'bg-amber-50 border-amber-500 text-amber-800' :
                      'bg-red-50 border-red-500 text-red-800'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <span className="text-base">🤖</span>
                        {validationResult.status === 'GREAT_DEAL' && 'Great Deal!'}
                        {validationResult.status === 'FAIR' && 'Fair Market Price'}
                        {validationResult.status === 'HIGH' && 'Above Market Average'}
                        {(validationResult.status === 'SUSPICIOUSLY_HIGH' || validationResult.status === 'SUSPICIOUSLY_LOW') && 'Suspicious Price Alert'}
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed">{validationResult.message}</p>
                      <p className="text-[10px] font-semibold mt-1 opacity-70 uppercase tracking-wider">
                        Market Avg: ₹{validationResult.market_avg} /{product.unit}
                      </p>
                    </div>
                  )}
                </div>
                {product.bulkPricing?.length > 0 && (
                  <div className="mt-3 bg-amber-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-700 mb-1">Bulk Pricing</p>
                    {product.bulkPricing.map((bp, i) => (
                      <p key={i} className="text-xs text-amber-600">{bp.minQty}+ units: ₹{bp.price}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between mb-6 bg-slate-50 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-600">Quantity</span>
                <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2.5 hover:bg-slate-50 rounded-l-xl"><Minus size={16} /></button>
                  <span className="text-lg font-bold min-w-[32px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="p-2.5 hover:bg-slate-50 rounded-r-xl"><Plus size={16} /></button>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-500">Estimated Total</span>
                <span className="text-2xl font-black text-slate-800">₹{(product.price * quantity).toLocaleString()}</span>
              </div>

              {/* Add to Cart */}
              <button onClick={handleAddToCart}
                className="w-full btn-primary py-4 text-lg shadow-xl hover:shadow-2xl shadow-amber-500/30 justify-center"
                disabled={!product.inStock}>
                {product.inStock ? <><ShoppingCart size={20} /> Add to Cart</> : 'Out of Stock'}
              </button>

              {/* Delivery Info */}
              <div className="mt-6 space-y-3">
                {product.deliveryAvailable && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Truck size={16} className="text-blue-500" />
                    <span>Delivery Available {product.estimatedDeliveryTime && `• ${product.estimatedDeliveryTime}`}</span>
                  </div>
                )}
                {product.pickupAvailable && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Package size={16} className="text-emerald-500" />
                    <span>Self Pickup Available</span>
                  </div>
                )}
                {product.minOrderQty > 1 && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock size={16} className="text-amber-500" />
                    <span>Min order: {product.minOrderQty} {product.unit}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shop Card */}
            {product.shop && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Sold By</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                    <Store size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{product.shop.name}</h4>
                    {product.shop.address && (
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {product.shop.address.area}, {product.shop.address.city || 'Hyderabad'}
                      </p>
                    )}
                    {product.shop.verificationStatus === 'verified' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                        <ShieldCheck size={10} /> Verified Shop
                      </span>
                    )}
                  </div>
                </div>
                {product.shop.phone && (
                  <a href={`tel:${product.shop.phone}`}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
                    <Phone size={16} /> Call Shop
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* More from this shop */}
        {otherProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-black text-slate-800 mb-6">More from this Shop</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {otherProducts.map(p => (
                <div key={p._id} onClick={() => navigate(`/materials/${p._id}`)}
                  className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-amber-300 hover:shadow-lg transition-all cursor-pointer">
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2">{p.title}</h3>
                  <p className="text-amber-600 font-black text-sm mt-2">₹{p.price?.toLocaleString()} <span className="text-xs text-slate-400">/{p.unit}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
