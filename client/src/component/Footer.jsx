import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3><i className="fas fa-blog"></i> My Blog</h3>
            <p>Share your thoughts and stories with the world. Connect with readers and writers everywhere.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/"><i className="fas fa-home"></i> Home</Link></li>
              <li><Link to="/admin/login"><i className="fas fa-user-shield"></i> Admin</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} My Blog. All rights reserved.</p>
          <p>Made with <i className="fas fa-heart"></i> for bloggers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;