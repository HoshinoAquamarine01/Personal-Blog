import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";

const Shop = () => {
  const { user, updateUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get("/shop");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId) => {
    try {
      const res = await api.post(`/shop/purchase/${itemId}`);
      alert("✅ Mua thành công!");
      updateUser({ ...user, coins: res.data.coins, ownedEffects: res.data.ownedEffects });
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi mua vật phẩm");
    }
  };

  const handleEquip = async (effectId) => {
    try {
      await api.post(`/shop/equip/${effectId}`);
      alert("✅ Đã trang bị!");
      updateUser({ ...user, activeEffect: effectId });
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi trang bị");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              <i className="fas fa-store text-primary mr-3"></i>
              Cửa hàng
            </h1>
            <p className="text-gray-600">Mua hiệu ứng và trang trí</p>
          </div>
          <div className="card px-6 py-3">
            <div className="flex items-center gap-3">
              <i className="fas fa-coins text-yellow-500 text-2xl"></i>
              <div>
                <p className="text-sm text-gray-600">Xu của bạn</p>
                <p className="text-2xl font-bold text-slate-800">{user?.coins || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => {
            const owned = user?.ownedEffects?.includes(item.effectId);
            const equipped = user?.activeEffect === item.effectId;

            return (
              <div key={item._id} className="card hover:shadow-xl transition-shadow">
                <div className="text-center mb-4">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    equipped ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' : 'bg-blue-100'
                  }`}>
                    <i className={`fas ${item.icon} text-3xl ${equipped ? 'text-white' : 'text-blue-600'}`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-coins text-yellow-500"></i>
                      <span className="font-bold text-lg">{item.price} xu</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.effectType === 'avatar' ? 'bg-purple-100 text-purple-800' :
                      item.effectType === 'badge' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.effectType}
                    </span>
                  </div>

                  {equipped ? (
                    <button className="btn bg-green-500 text-white w-full" disabled>
                      <i className="fas fa-check mr-2"></i>Đang sử dụng
                    </button>
                  ) : owned ? (
                    <button
                      onClick={() => handleEquip(item.effectId)}
                      className="btn btn-secondary w-full"
                    >
                      <i className="fas fa-check-circle mr-2"></i>Trang bị
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item._id)}
                      className="btn btn-primary w-full"
                      disabled={user?.coins < item.price}
                    >
                      <i className="fas fa-shopping-cart mr-2"></i>Mua
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Shop;
