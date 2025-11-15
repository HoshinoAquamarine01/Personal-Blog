import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const PaymentConfirm = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post(`/vip/confirm/${paymentId}`);
      alert("✅ Kích hoạt VIP thành công!");
      navigate("/profile");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xác nhận thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12">
      <div className="card max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check-circle text-green-600 text-4xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Xác nhận thanh toán
        </h1>
        <p className="text-gray-600 mb-8">
          Mã giao dịch: <span className="font-mono font-bold">{paymentId}</span>
        </p>
        <div className="space-y-4">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="btn btn-primary w-full text-lg py-3"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2"></i>Xác nhận đã thanh toán
              </>
            )}
          </button>
          <button
            onClick={() => navigate("/")}
            className="btn btn-secondary w-full"
          >
            <i className="fas fa-times mr-2"></i>Hủy
          </button>
        </div>
        <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded text-left">
          <p className="text-sm text-yellow-800">
            <i className="fas fa-info-circle mr-2"></i>
            Đây là demo. Trong thực tế, bạn sẽ được chuyển đến cổng thanh toán.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirm;
