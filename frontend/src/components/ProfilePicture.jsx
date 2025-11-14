import React, { useState, useRef } from 'react';

const ProfilePicture = ({ src, size = 'large', editable = false, onUpload, onRemove }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const sizes = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    xlarge: 'w-40 h-40'
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Call onUpload callback with file
    if (onUpload) {
      onUpload(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  const displaySrc = preview || src;

  return (
    <div className="relative inline-block">
      <div className={`${sizes[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-gray-300`}>
        {displaySrc ? (
          <img
            src={displaySrc}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-2xl">
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {editable && (
        <div className="absolute bottom-0 right-0 flex gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-mun-red text-white rounded-full p-2 hover:bg-red-700 shadow-lg"
            title="Upload photo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          {displaySrc && (
            <button
              onClick={handleRemove}
              className="bg-gray-600 text-white rounded-full p-2 hover:bg-gray-700 shadow-lg"
              title="Remove photo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;

