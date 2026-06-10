import { useEffect, useState } from "react";
import logo from "../assets/logo.jpg";
// Ensure your custom CSS is imported here
import "./AppStartupAnimation.css"; 

export default function AppStartupAnimation({ children }) {
  const [isExiting, setIsExiting] = useState(false);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    // Start the fade-out effect
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // Remove the splash screen from the DOM entirely
    const appTimer = setTimeout(() => {
      setShowApp(true);
    }, 3500); // 3500ms (2500ms wait + 1000ms exit transition)

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(appTimer);
    };
  }, []);

  if (showApp) {
    return children;
  }

  return (
    <div
      className={`splash-screen ${isExiting ? "fade-out-active" : ""}`}
    >
      <div className="splash-card">
        <div className="logo-container">
          <img src={logo} alt="KLE Logo" className="logo" />
        </div>

        <h1 className="title">KLE College Management</h1>
        <p className="subtitle">Smart Campus • Smart Management</p>

        <div className="divider"></div>

        <p className="developer">
          Developed by <strong>︻╦̵̵̿╤─Ｖｉｓｈａｌ♥</strong> & <strong>︻╦̵̵̿╤─Ｉｒａｎｎａ♥</strong>
        </p>

        <div className="progress">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
}