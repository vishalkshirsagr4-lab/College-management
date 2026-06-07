import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 text-center max-w-md w-full">

        {/* Icon */}
        <div className="text-5xl mb-4">🚫</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">
          Page not found
        </h2>

        {/* Description */}
        <p className="text-gray-500 text-sm mt-2">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Button */}
        <Link
          to="/"
          className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;