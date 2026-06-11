import { useEffect, useState } from "react";
import logo from "../assets/logo.jpg";
import "animate.css"; // Import the library
import "./AppStartupAnimation.css"; 

export default function AppStartupAnimation({ children }) {
  const [isExiting, setIsExiting] = useState(false);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    // Start the exit animation after 2.5 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // Remove the splash screen after the animation duration (usually 1s for animate__fadeOut)
    const appTimer = setTimeout(() => {
      setShowApp(true);
    }, 3500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(appTimer);
    };
  }, []);

  if (showApp) return children;

  return (
    <div
      className={`splash-screen animate__animated ${
        isExiting ? "animate__fadeOut" : ""
      }`}
    >
      <div className="splash-card">
        <div className="logo-container">
          <img src={logo} alt="KLE Logo" className="logo" />
        </div>

        <h1 className="title">KLE College Management</h1>
        <p className="subtitle">Smart Campus • Smart Management</p>

        <div className="divider"></div>

        <p className="developer">
          Developed by <strong>Ｖｉｓｈａｌ</strong> & <strong>Ｉｒａｎｎａ</strong>
        </p> 

        <div className="progress">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
}