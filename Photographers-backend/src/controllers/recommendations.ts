import { Request, Response } from "express";
import { RecommendationService } from "../services/recommendationService";

const recommendationService = new RecommendationService();

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid user ID is required" });
    }

    const recommendations = await recommendationService.getRecommendations(
      userId
    );

    res.json({
      success: true,
      count: recommendations.length,
      recommendations: recommendations.map((rec) => ({
        photographer: {
          id: rec.photographer.id,
          name: rec.photographer.name,
          description: rec.photographer.description,
          profilePicture: rec.photographer.profilepicUrl,
          photoCount: rec.photographer.photos.length,
          samplePhotos: rec.photographer.photos.slice(0, 6).map((photo) => ({
            id: photo.id,
            title: photo.title,
            imageUrl: photo.imageUrl,
            description: photo.description,
          })),
        },
        similarityScore: Math.round(rec.similarityScore * 100) / 100, // Round to 2 decimals
        matchingTags: rec.matchingTags,
        explanation: rec.explanation,
      })),
    });
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    res.status(500).json({
      error: "Failed to get recommendations",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
