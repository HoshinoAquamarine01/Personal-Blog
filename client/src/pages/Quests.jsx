import React, { useState, useEffect } from "react";
import api from "../utils/api";

const Quests = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      console.log("Fetching quests...");
      const res = await api.get("/quest");
      console.log("Quests response:", res.data);
      setQuests(res.data.quests || []);
    } catch (error) {
      console.error("Error fetching quests:", error);
      alert("Lỗi: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (questId) => {
    try {
      const res = await api.post(`/quest/${questId}/claim`);
      alert(res.data.message);
      fetchQuests();
    } catch (error) {
      alert(error.response?.data?.error || "Lỗi khi nhận thưởng");
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
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">
        <i className="fas fa-tasks text-blue-600 mr-2"></i>
        Nhiệm vụ
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quests.map((quest) => (
          <div key={quest._id} className="card">
            <h3 className="text-xl font-bold mb-2">{quest.title}</h3>
            <p className="text-gray-600 mb-4">{quest.description}</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>
                  Tiến độ: {quest.progress}/{quest.targetCount}
                </span>
                <span>
                  {Math.round((quest.progress / quest.targetCount) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (quest.progress / quest.targetCount) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Rewards */}
            <div className="mb-4 flex gap-2">
              {quest.reward.points > 0 && (
                <span className="badge bg-yellow-100 text-yellow-800">
                  +{quest.reward.points} điểm
                </span>
              )}
              {quest.reward.badge && (
                <span className="badge bg-purple-100 text-purple-800">
                  Huy hiệu: {quest.reward.badge}
                </span>
              )}
              {quest.reward.vipDays > 0 && (
                <span className="badge bg-orange-100 text-orange-800">
                  +{quest.reward.vipDays} ngày VIP
                </span>
              )}
            </div>

            {/* Action Button */}
            {quest.isCompleted ? (
              quest.rewardClaimed ? (
                <button disabled className="btn btn-secondary w-full">
                  <i className="fas fa-check-circle mr-2"></i>
                  Đã hoàn thành
                </button>
              ) : (
                <button
                  onClick={() => handleClaimReward(quest._id)}
                  className="btn btn-primary w-full"
                >
                  <i className="fas fa-gift mr-2"></i>
                  Nhận thưởng
                </button>
              )
            ) : (
              <button disabled className="btn btn-secondary w-full">
                Đang thực hiện...
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quests;
