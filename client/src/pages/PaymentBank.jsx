import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const PaymentBank = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-university text-blue-600 text-4xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Chuyển khoản ngân hàng
            </h1>
            <p className="text-gray-600">
              Vui lòng chuyển khoản theo thông tin bên dưới
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                Thông tin chuyển khoản
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-bold text-slate-800">Vietcombank</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Số tài khoản:</span>
                  <span className="font-bold text-slate-800 font-mono">1234567890</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-800">MYBLOG VIP</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Nội dung:</span>
                  <span className="font-bold text-slate-800 font-mono">{paymentId}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-sm text-yellow-800">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <strong>Lưu ý:</strong> Vui lòng ghi đúng nội dung chuyển khoản để hệ thống tự động xác nhận thanh toán
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/vip")}
                className="btn btn-secondary flex-1"
              >
                <i className="fas fa-arrow-left mr-2"></i>Quay lại
              </button>
              <button
                onClick={() => navigate(`/payment/return/${paymentId}`)}
                className="btn btn-primary flex-1"
              >
                <i className="fas fa-check mr-2"></i>Đã chuyển khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentBank;
