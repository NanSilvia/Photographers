import { Router } from "express";
import { getRecommendations } from "../controllers/recommendations";
import { hasRole } from "../middleware/authorization";

const recommendationRoutes = Router();

// Get personalized recommendations for a user
recommendationRoutes.get(
  "/:userId/recommendations",
  hasRole("user"),
  getRecommendations
);

export { recommendationRoutes };
