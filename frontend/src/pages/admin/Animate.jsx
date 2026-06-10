import 'animate.css';
import { useEffect, useState } from 'react';

export default function AppStartupAnimation({ children }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Wait for 1.5 seconds, then trigger the animation
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isVisible ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50 animate__animated animate__bounceOut">
          {/* Your Logo or Brand here */}
          <h1 className="text-4xl font-bold text-primary-600">𝒟𝑒𝓋𝓁𝑜𝓅𝑒𝒹 𝒷𝓎:𝐼𝓇𝒶𝓃𝓃𝒶 & 𝒱𝒾𝓈𝒽𝒶𝓁</h1>
        </div>
      ) : (
        children
      )}
    </>
  );
}