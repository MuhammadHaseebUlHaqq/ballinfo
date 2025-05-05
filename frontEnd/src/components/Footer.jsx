import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTwitter, 
  faFacebook, 
  faInstagram, 
  faYoutube, 
  faTiktok 
} from '@fortawesome/free-brands-svg-icons';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo">
            <Link to="/">
              <img src="/logo.png" alt="LaLiga Hub" />
            </Link>
            <p className="tagline">Your premier destination for Spanish football news and coverage</p>
          </div>
          
          <div className="footer-nav">
            <div className="footer-nav-column">
              <h3>Content</h3>
              <ul>
                <li><Link to="/news">News</Link></li>
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/videos">Videos</Link></li>
                <li><Link to="/stats">Stats</Link></li>
                <li><Link to="/transfers">Transfers</Link></li>
              </ul>
            </div>
            
            <div className="footer-nav-column">
              <h3>Competitions</h3>
              <ul>
                <li><Link to="/laliga">LaLiga</Link></li>
                <li><Link to="/copa-del-rey">Copa del Rey</Link></li>
                <li><Link to="/supercopa">Supercopa</Link></li>
                <li><Link to="/champions-league">Champions League</Link></li>
                <li><Link to="/europa-league">Europa League</Link></li>
              </ul>
            </div>
            
            <div className="footer-nav-column">
              <h3>Teams</h3>
              <ul>
                <li><Link to="/teams/real-madrid">Real Madrid</Link></li>
                <li><Link to="/teams/barcelona">Barcelona</Link></li>
                <li><Link to="/teams/atletico-madrid">Atlético Madrid</Link></li>
                <li><Link to="/teams/sevilla">Sevilla</Link></li>
                <li><Link to="/teams/all">View All Teams</Link></li>
              </ul>
            </div>
            
            <div className="footer-nav-column">
              <h3>More</h3>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/advertise">Advertise</Link></li>
                <li><Link to="/help">Help Center</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-middle">
          <div className="newsletter">
            <h3>Subscribe to our Newsletter</h3>
            <p>Get the latest news and updates delivered to your inbox</p>
            <form className="subscribe-form">
              <input 
                type="email" 
                placeholder="Your email address" 
                aria-label="Email address for newsletter"
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
          
          <div className="social-links">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FontAwesomeIcon icon={faYoutube} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <FontAwesomeIcon icon={faTiktok} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {new Date().getFullYear()} LaLiga Hub. All Rights Reserved.
          </div>
          
          <div className="legal-links">
            <Link to="/terms">Terms of Use</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookies">Cookie Policy</Link>
            <Link to="/accessibility">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 