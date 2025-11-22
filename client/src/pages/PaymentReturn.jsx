import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const PaymentReturn = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        await api.post(`/vip/confirm/${paymentId}`);
        setStatus("success");
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 3000);
      } catch (err) {
        setStatus("error");
      }
    };

    if (paymentId) {
      confirmPayment();
    }
  }, [paymentId, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12">
      <div className="card max-w-md w-full text-center">
        {status === "processing" && (
          <>
            <div className="spinner mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">
              Đang xử lý thanh toán...
            </h1>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check-circle text-green-600 text-4xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 mb-4">
              Tài khoản VIP của bạn đã được kích hoạt
            </p>
            <p className="text-sm text-gray-500">
              Đang chuyển hướng về trang chủ...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-times-circle text-red-600 text-4xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600 mb-6">
              Đã có lỗi xảy ra trong quá trình thanh toán
            </p>
            <button
              onClick={() => navigate("/vip")}
              className="btn btn-primary"
            >
              <i className="fas fa-redo mr-2"></i>Thử lại
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;
