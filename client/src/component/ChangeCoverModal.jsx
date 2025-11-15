import { useState, useRef } from "react";
import { uploadCover } from "../services/userService";

export default function ChangeCoverModal({
  isOpen,
  currentCover,
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

    if (file.size > 10 * 1024 * 1024) {
      setError("Kích thước file phải nhỏ hơn 10MB");
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
      const result = await uploadCover(fileInputRef.current.files[0]);
      onSuccess(result.coverImage);
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
      <div className="modal-content" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <h2>Đổi Ảnh Bìa</h2>
        </div>

        <div className="modal-body">
          <div className="cover-preview">
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="cover-preview-image"
                />
              ) : currentCover ? (
                <img
                  src={currentCover}
                  alt="Current"
                  className="cover-preview-current"
                />
              ) : (
                <div className="cover-preview-default">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 mt-2">Chưa có ảnh bìa</p>
                </div>
              )}
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
              Định dạng: JPG, PNG, GIF (Tối đa 10MB) - Khuyến nghị: 1200x300px
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
