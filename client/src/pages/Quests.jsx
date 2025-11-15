import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";

const Quests = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const res = await api.get("/quests");
      setQuests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (questId) => {
    try {
      await api.post(`/quests/${questId}/claim`);
      alert("✅ Đã nhận thưởng!");
      fetchQuests();
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi nhận thưởng");
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
              <i className="fas fa-tasks text-primary mr-3"></i>
              Nhiệm vụ
            </h1>
            <p className="text-gray-600">Hoàn thành nhiệm vụ để nhận xu</p>
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

        <div className="grid md:grid-cols-2 gap-6">
          {quests.map((quest) => (
            <div key={quest._id} className="card hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`fas ${quest.icon} text-blue-600 text-2xl`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{quest.title}</h3>
                  <p className="text-gray-600 mb-4">{quest.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Tiến độ</span>
                      <span className="font-semibold">{quest.progress}/{quest.requirement}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((quest.progress / quest.requirement) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-coins text-yellow-500"></i>
                      <span className="font-bold text-lg">{quest.reward} xu</span>
                    </div>
                    {quest.claimed ? (
                      <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold">
                        <i className="fas fa-check mr-2"></i>Đã nhận
                      </span>
                    ) : quest.completed ? (
                      <button
                        onClick={() => handleClaim(quest._id)}
                        className="btn btn-primary"
                      >
                        <i className="fas fa-gift mr-2"></i>Nhận thưởng
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                        Chưa hoàn thành
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quests;
