import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const VipPurchase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const res = await api.get("/vip/pricing");
      setPlans(res.data.plans);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !selectedMethod) {
      alert("Vui lòng chọn gói VIP và phương thức thanh toán");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/vip/purchase", {
        duration: selectedPlan.duration,
        method: selectedMethod,
      });

      const { paymentUrl } = res.data;
      
      // Redirect to payment gateway
      if (paymentUrl.startsWith("http")) {
        window.location.href = paymentUrl;
      } else {
        navigate(paymentUrl);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi tạo thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const hasVipAccess = user?.isVip || user?.role === "admin" || user?.role === "manager";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            <i className="fas fa-crown text-yellow-500 mr-3"></i>
            Nâng cấp VIP
          </h1>
          <p className="text-gray-600 text-lg">
            Trải nghiệm tính năng cao cấp với gói VIP
          </p>
        </div>

        {hasVipAccess && (
          <div className="mb-8">
            {user?.isVip && user?.vipExpiresAt ? (
              <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-800 font-bold text-lg mb-2">
                      <i className="fas fa-crown mr-2"></i>
                      Tài khoản VIP đang hoạt động
                    </p>
                    <p className="text-yellow-700">
                      Còn lại: <span className="font-bold text-2xl">{Math.max(0, Math.ceil((new Date(user.vipExpiresAt) - new Date()) / (1000 * 60 * 60 * 24)))}</span> ngày
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Hết hạn: {new Date(user.vipExpiresAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-6xl">
                    <i className="fas fa-crown text-yellow-500"></i>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <p className="text-green-800 font-semibold">
                  <i className="fas fa-check-circle mr-2"></i>
                  Bạn đang có quyền truy cập VIP (Admin/Manager)
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            <i className="fas fa-gift mr-2"></i>Tính năng VIP
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card hover:shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-palette text-purple-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Tùy chỉnh giao diện</h3>
                  <p className="text-gray-600">Chuyển đổi giữa chế độ sáng và tối</p>
                </div>
              </div>
            </div>
            <div className="card hover:shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-star text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Huy hiệu VIP</h3>
                  <p className="text-gray-600">Hiển thị huy hiệu VIP trên profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            <i className="fas fa-tags mr-2"></i>Chọn gói VIP
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.duration}
                onClick={() => setSelectedPlan(plan)}
                className={`card cursor-pointer transition-all ${
                  selectedPlan?.duration === plan.duration
                    ? "border-4 border-purple-500 shadow-xl"
                    : "hover:shadow-lg"
                }`}
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{plan.label}</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {plan.price.toLocaleString()}đ
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.round(plan.price / plan.duration * 30).toLocaleString()}đ/tháng
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            <i className="fas fa-credit-card mr-2"></i>Phương thức thanh toán
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { id: "momo", name: "MoMo", icon: "fas fa-mobile-alt", color: "pink" },
              { id: "zalopay", name: "ZaloPay", icon: "fas fa-wallet", color: "blue" },
              { id: "vnpay", name: "VNPay", icon: "fas fa-credit-card", color: "red" },
              { id: "bank_transfer", name: "Chuyển khoản", icon: "fas fa-university", color: "green" },
            ].map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`card cursor-pointer text-center transition-all ${
                  selectedMethod === method.id
                    ? "border-4 border-purple-500 shadow-xl"
                    : "hover:shadow-lg"
                }`}
              >
                <i className={`${method.icon} text-4xl text-${method.color}-600 mb-3`}></i>
                <p className="font-semibold">{method.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handlePurchase}
            disabled={loading || !selectedPlan || !selectedMethod}
            className="btn btn-primary text-lg px-12 py-4"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-shopping-cart mr-2"></i>
                Thanh toán {selectedPlan?.price.toLocaleString()}đ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VipPurchase;
