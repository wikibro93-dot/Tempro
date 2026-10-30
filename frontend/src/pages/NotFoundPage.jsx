import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="container text-center my-5 py-5">
      <Helmet>
        <title>404 - Page Not Found | TempMail Pk</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="display-1 fw-bold">404</h1>
      <p className="lead">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary mt-3">
        Go Back Home
      </Link>
    </div>
  );
}
export default NotFoundPage;
