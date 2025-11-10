import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4 animate-slideUp">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-blog text-white text-lg"></i>
            </div>
            <h3 className="text-2xl font-bold text-blue-400">MyBlog</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Chia sẻ kiến thức, câu chuyện và cảm hứng với cộng đồng toàn cầu.
          </p>
          <div className="flex gap-3 pt-2">
            <a
              href="#"
              className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-all"
              title="Facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center hover:bg-blue-300 transition-all"
              title="Twitter"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-500 transition-all"
              title="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div
          className="space-y-4 animate-slideUp"
          style={{ animationDelay: "0.1s" }}
        >
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fas fa-link text-blue-400"></i> Liên kết nhanh
          </h4>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                → Trang chủ
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                → Đăng nhập
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                → Đăng ký
              </Link>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                → Liên hệ
              </a>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div
          className="space-y-4 animate-slideUp"
          style={{ animationDelay: "0.2s" }}
        >
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fas fa-folder text-blue-400"></i> Danh mục
          </h4>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                → Công nghệ
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                → Cuộc sống
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                → Kinh doanh
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                → Du lịch
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div
          className="space-y-4 animate-slideUp"
          style={{ animationDelay: "0.3s" }}
        >
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fas fa-envelope text-blue-400"></i> Liên hệ
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <i className="fas fa-map-marker-alt text-blue-400 mt-1"></i>
              <span className="text-gray-400 text-sm">
                123 Đường ABC, TP HCM, Việt Nam
              </span>
            </li>
            <li className="flex items-center gap-3">
              <i className="fas fa-phone text-blue-400"></i>
              <a
                href="tel:+84123456789"
                className="text-gray-400 hover:text-blue-400"
              >
                +84 (123) 456-789
              </a>
            </li>
            <li className="flex items-center gap-3">
              <i className="fas fa-envelope text-blue-400"></i>
              <a
                href="mailto:info@myblog.com"
                className="text-gray-400 hover:text-blue-400"
              >
                info@myblog.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Bottom Footer */}
      <div className="container py-6 flex flex-col md:flex-row justify-between items-center gap-4 animate-fadeIn">
        <p className="text-gray-500 text-sm text-center md:text-left">
          © {currentYear}{" "}
          <span className="text-blue-400 font-bold">MyBlog</span>. Tất cả quyền
          được bảo lưu.
        </p>
        <div className="flex gap-6 text-sm">
          <a
            href="#"
            className="text-gray-500 hover:text-blue-400 transition-colors"
          >
            Chính sách bảo mật
          </a>
          <a
            href="#"
            className="text-gray-500 hover:text-blue-400 transition-colors"
          >
            Điều khoản sử dụng
          </a>
          <a
            href="#"
            className="text-gray-500 hover:text-blue-400 transition-colors"
          >
            Liên hệ hỗ trợ
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
