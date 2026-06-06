import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="page-shell">
    <div className="card card-panel">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="button button-primary">Go home</Link>
    </div>
  </div>
);

export default NotFound;
