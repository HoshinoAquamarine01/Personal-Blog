import express from "express";

const router = express.Router();

const knowledgeBase = {
  "tạo bài viết":
    "Để tạo bài viết, hãy:\n1. Click 'Tạo bài viết' trên menu\n2. Nhập tiêu đề và nội dung\n3. Chọn danh mục và tags\n4. Click 'Đăng bài'",

  "đổi avatar":
    "Để đổi avatar:\n1. Vào trang Profile của bạn\n2. Click nút 'Đổi Avatar' ở góc avatar\n3. Chọn ảnh từ máy (tối đa 5MB)\n4. Click 'Lưu'",

  "nhiệm vụ":
    "Nhiệm vụ là các thử thách giúp bạn kiếm điểm và huy hiệu:\n- Tạo bài viết\n- Chat với người khác\n- Hoàn thiện hồ sơ\n- Theo dõi người dùng\n\nVào 'Nhiệm vụ' để xem chi tiết!",

  chat: "Để chat với người khác:\n1. Click 'Tìm kiếm' trên menu\n2. Nhập username cần tìm\n3. Click 'Chat' ở profile của họ\n4. Bắt đầu trò chuyện!",

  "theo dõi":
    "Để theo dõi ai đó:\n1. Vào profile của họ\n2. Click nút 'Theo dõi'\n3. Bạn sẽ thấy bài viết của họ trên trang chủ",

  coin: "Coin là đơn vị tiền tệ trong hệ thống. Bạn có thể:\n- Kiếm coin qua nhiệm vụ\n- Dùng coin để mua VIP\n- Admin có thể tặng coin",

  vip: "Tài khoản VIP có:\n- Badge VIP vàng\n- Ưu tiên hỗ trợ\n- Tính năng đặc biệt\n\nLiên hệ admin để mua VIP!",
};

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.json({
        answer: "Bạn có câu hỏi gì? Hãy hỏi tôi nhé! 😊",
      });
    }

    const lowerQuestion = question.toLowerCase();

    // Tìm câu trả lời phù hợp
    for (const [keyword, answer] of Object.entries(knowledgeBase)) {
      if (lowerQuestion.includes(keyword)) {
        return res.json({ answer });
      }
    }

    // Câu trả lời mặc định
    res.json({
      answer:
        "Xin lỗi, tôi chưa hiểu câu hỏi này. Bạn có thể hỏi về:\n- Tạo bài viết\n- Đổi avatar\n- Nhiệm vụ\n- Chat\n- Theo dõi\n- Coin và VIP\n\nHoặc liên hệ admin để được hỗ trợ!",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
