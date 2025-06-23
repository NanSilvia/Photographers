import React, { useState } from "react";
import { RecommendationResult } from "../service/RecommendationsApi";
import { useNavigate } from "react-router-dom";
import { API_URL, addPhotographerToUserList } from "../api";
import "./PhotographerPreviewModal.css";

interface Props {
  recommendation: RecommendationResult | null;
  onClose: () => void;
}

export const PhotographerPreviewModal: React.FC<Props> = ({
  recommendation,
  onClose,
}) => {
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const photos = recommendation?.photographer.samplePhotos || [];

  // Helper function to construct image URL
  const getImageUrl = (imageUrl: string) => {
    // If imageUrl is already a full URL, use it as is
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    // If it's just an ID or filename, construct the full URL
    const fullUrl = `${API_URL}/file/${imageUrl}`;
    console.log(`Constructing image URL: ${imageUrl} -> ${fullUrl}`);
    return fullUrl;
  };

  const handleAddToMyList = async () => {
    if (!recommendation) return;

    setAdding(true);
    try {
      // Add photographer to user's list (creates relationship)
      await addPhotographerToUserList(recommendation.photographer.id);
      onClose();
      // Navigate to the photographer's profile
      navigate(`/photographers/${recommendation.photographer.id}`);
    } catch (error) {
      console.error("Error adding photographer to list:", error);
    } finally {
      setAdding(false);
    }
  };

  const handleViewProfile = () => {
    if (!recommendation) return;
    onClose();
    navigate(`/photographers/${recommendation.photographer.id}`);
  };

  if (!recommendation) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="photographer-preview-modal"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="photographer-header">
            <div className="photographer-avatar-large">
              {recommendation.photographer.profilePicture ? (
                <img
                  src={getImageUrl(recommendation.photographer.profilePicture)}
                  alt={recommendation.photographer.name}
                  onError={(e) => {
                    console.error(
                      `Failed to load profile image: ${getImageUrl(
                        recommendation.photographer.profilePicture!
                      )}`
                    );
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="avatar-placeholder-large">
                  {recommendation.photographer.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="photographer-info">
              <h2>{recommendation.photographer.name}</h2>
              <p className="photo-count">
                {recommendation.photographer.photoCount} photos
              </p>
              <div className="matching-tags">
                <span className="tags-label">You both like:</span>
                <div className="tags-list">
                  {recommendation.matchingTags.slice(0, 4).map((tag, index) => (
                    <span key={index} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="bio-section">
            <p className="bio">{recommendation.photographer.description}</p>
            <p className="explanation">{recommendation.explanation}</p>
          </div>

          <div className="photos-preview">
            <h3>Recent Work</h3>
            <div className="photos-grid">
              {photos.length > 0 ? (
                photos.map((photo) => (
                  <div key={photo.id} className="photo-preview">
                    <img
                      src={getImageUrl(photo.imageUrl)}
                      alt={photo.title}
                      onError={(e) => {
                        console.error(
                          `Failed to load image: ${getImageUrl(photo.imageUrl)}`
                        );
                        const target = e.currentTarget;
                        target.style.display = "none";
                        // Show a placeholder
                        const placeholder = document.createElement("div");
                        placeholder.className = "image-placeholder";
                        placeholder.textContent = "Image not found";
                        placeholder.style.cssText = `
                          width: 100%;
                          height: 100%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          background: #f0f0f0;
                          color: #666;
                          font-size: 12px;
                        `;
                        target.parentNode?.appendChild(placeholder);
                      }}
                      onLoad={() =>
                        console.log(
                          `Successfully loaded image: ${getImageUrl(
                            photo.imageUrl
                          )}`
                        )
                      }
                    />
                    <div className="photo-overlay">
                      <span className="photo-title">{photo.title}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-photos">
                  <p>No photos available to preview</p>
                  <p style={{ fontSize: "12px", color: "#888" }}>
                    Debug: Photographer ID {recommendation.photographer.id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="add-button"
            onClick={handleAddToMyList}
            disabled={adding}
          >
            {adding ? "Adding..." : "Add to My Photographers"}
          </button>
          <button className="view-button" onClick={handleViewProfile}>
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
};
