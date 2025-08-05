import React from 'react';
import './Loader.css';

export default function Loader() {
  return (
    <div className="loader-overlay" role="status" aria-label="Loading">
      <div className="loader"></div>
    </div>
  );
} 