import { useState, useRef } from "react";
import { uploadAvatar } from '../services/userService';

export default function ChangeAvatarModal({
  isOpen,
  currentAvatar,
  onClose,
  onSuccess,
}) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước file phải nhỏ hơn 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError("Vui lòng chọn file");
      return;
    }

    setLoading(true);
    try {
      const result = await uploadAvatar(fileInputRef.current.files[0]);
      onSuccess(result.avatar);
      handleCancel();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Upload thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Đổi Avatar</h2>
        </div>

        <div className="modal-body">
          <div className="avatar-preview">
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="avatar-preview-image"
                />
              ) : currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Current"
                  className="avatar-preview-current"
                />
              ) : (
                <div className="avatar-preview-default">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              {preview && <div className="avatar-preview-highlight"></div>}
            </div>
          </div>

          <div className="file-input-wrapper">
            <label className="file-input-label">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
              />
            </label>
            <p className="file-input-hint">
              Định dạng: JPG, PNG, GIF (Tối đa 5MB)
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="btn-modal-cancel"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || !preview}
            className="btn-modal-save"
          >
            {loading && (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading ? "Đang tải..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
