/**
 * Upload Progress Component
 * 
 * Displays file upload progress with a progress bar
 */

import React from 'react';
import './UploadProgress.css';

/**
 * UploadProgress component
 * @param {Object} props
 * @param {number} props.progress - Upload progress (0-100)
 * @param {string} props.fileName - Name of the file being uploaded
 * @param {boolean} props.show - Whether to show the component
 * @param {string} props.className - Additional CSS classes
 */
export default function UploadProgress({ 
  progress = 0, 
  fileName = '', 
  show = true,
  className = '' 
}) {
  if (!show) return null;

  return (
    <div className={`upload-progress ${className}`}>
      {fileName && (
        <div className="upload-progress-filename">
          {fileName}
        </div>
      )}
      <div className="upload-progress-bar-container">
        <div 
          className="upload-progress-bar"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <div className="upload-progress-text">
        {Math.round(progress)}%
      </div>
    </div>
  );
}

