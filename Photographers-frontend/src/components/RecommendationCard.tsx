import React, { useState } from "react";
import { RecommendationResult } from "../service/RecommendationsApi";
import { PhotographerPreviewModal } from "./PhotographerPreviewModal";
import "./RecommendationCard.css";

interface Props {
  recommendation: RecommendationResult;
}

export const RecommendationCard: React.FC<Props> = ({ recommendation }) => {
  const [showModal, setShowModal] = useState(false);
  const { photographer, similarityScore, matchingTags, explanation } =
    recommendation;

  const handleExplore = () => {
    setShowModal(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "#4caf50"; // Green for high similarity
    if (score >= 2) return "#ff9800"; // Orange for medium similarity
    return "#757575"; // Gray for low similarity
  };

  return (
    <div className="recommendation-card">
      <div className="recommendation-header">
        <div className="photographer-info">
          <div className="photographer-avatar">
            {photographer.profilePicture ? (
              <img src={photographer.profilePicture} alt={photographer.name} />
            ) : (
              <div className="avatar-placeholder">
                {photographer.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="photographer-details">
            <h3 className="photographer-name">{photographer.name}</h3>
            <p className="photo-count">{photographer.photoCount} photos</p>
          </div>
        </div>
        <div
          className="similarity-score"
          style={{ color: getScoreColor(similarityScore) }}
        >
          {similarityScore > 0 ? `${similarityScore}★` : "New"}
        </div>
      </div>

      <div className="recommendation-body">
        <p className="photographer-bio">{photographer.description}</p>

        {matchingTags.length > 0 && (
          <div className="matching-tags">
            <span className="tags-label">Matching interests:</span>
            <div className="tags-list">
              {matchingTags.slice(0, 4).map((tag, index) => (
                <span key={index} className="tag-chip">
                  {tag}
                </span>
              ))}
              {matchingTags.length > 4 && (
                <span className="tag-chip more-tags">
                  +{matchingTags.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        <p className="explanation">{explanation}</p>
      </div>

      <div className="recommendation-footer">
        <button className="explore-button" onClick={handleExplore}>
          Explore Work
        </button>
      </div>

      {showModal && (
        <PhotographerPreviewModal
          recommendation={recommendation}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
