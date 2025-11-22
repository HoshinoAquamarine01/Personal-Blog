import React, { useState } from "react";
import { useAuth } from "../context/Authcontext";

const Shop = () => {
  const { user, updateProfile } = useAuth();
  const [userCoins, setUserCoins] = useState(user?.coins || 100);
  const [purchasedEffects, setPurchasedEffects] = useState(user?.ownedEffects || []);
  const [loading, setLoading] = useState(false);

  const api = import('../utils/api').then(module => module.default);

  const effects = [
    {
      id: "rainbow",
      name: "Rainbow Border",
      price: 50,
      description: "Colorful rainbow border around profile",
      preview: "border-4 border-gradient-to-r from-red-500 via-yellow-500 to-blue-500"
    },
    {
      id: "glow",
      name: "Neon Glow",
      price: 30,
      description: "Glowing neon effect",
      preview: "shadow-lg shadow-blue-500/50 border-2 border-blue-400"
    },
    {
      id: "sparkle",
      name: "Sparkle Animation",
      price: 75,
      description: "Sparkling stars animation",
      preview: "animate-pulse bg-gradient-to-r from-purple-400 to-pink-400"
    },
    {
      id: "fire",
      name: "Fire Effect",
      price: 60,
      description: "Burning fire animation",
      preview: "bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 animate-bounce"
    }
  ];

  const buyEffect = async (effect) => {
    if (loading || userCoins < effect.price || purchasedEffects.includes(effect.id)) return;
    
    setLoading(true);
    try {
      const apiModule = await api;
      const response = await apiModule.post('/shop/buy-effect', {
        effectId: effect.id,
        price: effect.price
      });
      
      setUserCoins(response.data.coins);
      setPurchasedEffects(response.data.ownedEffects);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const activateEffect = (effectId) => {
    document.body.className = `effect-${effectId}`;
    setTimeout(() => {
      document.body.className = "";
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">
            ✨ Magic Shop ✨
          </h1>
          <div className="bg-yellow-500 text-black px-6 py-2 rounded-full inline-block font-bold">
            💰 {userCoins} Coins
          </div>
        </div>

        {/* Effects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {effects.map((effect) => {
            const owned = purchasedEffects.includes(effect.id);
            const canBuy = userCoins >= effect.price;

            return (
              <div
                key={effect.id}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${
                  owned ? "border-green-400 bg-green-500/20" : "border-white/20"
                }`}
              >
                {/* Preview */}
                <div className={`w-full h-32 rounded-lg mb-4 ${effect.preview} flex items-center justify-center`}>
                  <span className="text-white font-bold">PREVIEW</span>
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-white mb-2">{effect.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{effect.description}</p>
                
                {/* Price & Button */}
                <div className="flex justify-between items-center">
                  <span className="text-yellow-400 font-bold">💰 {effect.price}</span>
                  
                  {owned ? (
                    <button
                      onClick={() => activateEffect(effect.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                      USE
                    </button>
                  ) : (
                    <button
                      onClick={() => buyEffect(effect)}
                      disabled={!canBuy}
                      className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                        canBuy
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gray-500 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      BUY
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Owned Effects */}
        {purchasedEffects.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">🎒 Your Effects</h2>
            <div className="flex flex-wrap gap-4">
              {purchasedEffects.map((effectId) => {
                const effect = effects.find(e => e.id === effectId);
                return (
                  <button
                    key={effectId}
                    onClick={() => activateEffect(effectId)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold hover:scale-110 transition-transform"
                  >
                    ✨ {effect?.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;