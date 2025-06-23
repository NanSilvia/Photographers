import React, { useState, useEffect } from "react";
import {
  RecommendationsApi,
  RecommendationResult,
} from "../service/RecommendationsApi";
import { RecommendationCard } from "../components/RecommendationCard";
import { CurrentUser } from "../service/AuthenticationService";
import "./RecommendationsPage.css";

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<
    RecommendationResult[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecommendations = async () => {
    try {
      setError(null);
      const currentUser = await CurrentUser();

      if (!currentUser) {
        setError("You must be logged in to see recommendations");
        return;
      }

      const response = await RecommendationsApi.getRecommendations(
        currentUser.id
      );
      setRecommendations(response.recommendations);
    } catch (err) {
      console.error("Error loading recommendations:", err);
      setError("Failed to load recommendations. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="recommendations-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Finding photographers you'll love...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-page">
        <div className="error-container">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={loadRecommendations} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <div className="header-content">
          <h1>Recommended for You</h1>
          <p className="subtitle">
            Discover photographers whose work matches your taste based on photos
            you've liked
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className={`refresh-button ${refreshing ? "refreshing" : ""}`}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📸</div>
          <h2>No recommendations yet</h2>
          <p>
            Start rating some photos to get personalized photographer
            recommendations! The more photos you rate, the better our
            suggestions become.
          </p>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.photographer.id}
              recommendation={recommendation}
            />
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations-footer">
          <p className="footer-text">
            Showing {recommendations.length} recommendations • Based on your
            ratings of{" "}
            {recommendations.reduce(
              (sum, rec) => sum + rec.matchingTags.length,
              0
            )}{" "}
            matching interests
          </p>
        </div>
      )}
    </div>
  );
};
