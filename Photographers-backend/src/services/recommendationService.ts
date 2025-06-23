import { AppDataSource } from "../databaseHelper/dataSource";
import { Photo } from "../model/photo";
import { Rating } from "../model/rating";
import { Photographer } from "../model/photographer";
import { User } from "../model/user";

interface TagPreference {
  tag: string;
  score: number;
  count: number;
}

interface RecommendationResult {
  photographer: Photographer;
  similarityScore: number;
  matchingTags: string[];
  explanation: string;
}

export class RecommendationService {
  private photoRepository = AppDataSource.getRepository(Photo);
  private ratingRepository = AppDataSource.getRepository(Rating);
  private photographerRepository = AppDataSource.getRepository(Photographer);

  /**
   * Get user's tag preferences based on photos they rated 3+ stars
   */
  async getUserTagPreferences(userId: number): Promise<TagPreference[]> {
    // Get all photos the user rated 3+ stars with their tags
    const likedPhotos = await this.ratingRepository
      .createQueryBuilder("rating")
      .innerJoinAndSelect("rating.photo", "photo")
      .innerJoinAndSelect("photo.tags", "tags")
      .where("rating.userId = :userId", { userId })
      .andWhere("rating.rating >= 3")
      .getMany();

    // Calculate tag preferences
    const tagStats = new Map<string, { totalRating: number; count: number }>();

    likedPhotos.forEach((rating) => {
      rating.photo.tags.forEach((tag) => {
        const tagName = tag.name.toLowerCase();
        const current = tagStats.get(tagName) || { totalRating: 0, count: 0 };
        tagStats.set(tagName, {
          totalRating: current.totalRating + rating.rating,
          count: current.count + 1,
        });
      });
    });

    // Convert to preference scores
    const preferences: TagPreference[] = [];
    tagStats.forEach((stats, tag) => {
      preferences.push({
        tag,
        score: stats.totalRating / stats.count, // Average rating for this tag
        count: stats.count,
      });
    });

    // Sort by score descending
    return preferences.sort((a, b) => b.score - a.score);
  }

  /**
   * Get photographers the user has NOT added to their list
   */
  async getNewPhotographers(userId: number): Promise<Photographer[]> {
    // Get photographer IDs that are already in the user's list
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.photographers", "photographers")
      .where("user.id = :userId", { userId })
      .getOne();

    const excludeIds = user?.photographers?.map((p) => p.id) || [];

    // Get all photographers except those already in user's list
    const queryBuilder = this.photographerRepository
      .createQueryBuilder("photographer")
      .innerJoinAndSelect("photographer.photos", "photos")
      .innerJoinAndSelect("photos.tags", "tags");

    if (excludeIds.length > 0) {
      queryBuilder.where("photographer.id NOT IN (:...excludeIds)", {
        excludeIds,
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Calculate similarity score between user preferences and photographer
   */
  calculateSimilarityScore(
    userPreferences: TagPreference[],
    photographer: Photographer
  ): { score: number; matchingTags: string[] } {
    const photographerTags = new Set<string>();

    // Collect all unique tags from photographer's photos
    photographer.photos.forEach((photo) => {
      photo.tags.forEach((tag) => {
        photographerTags.add(tag.name.toLowerCase());
      });
    });

    let totalScore = 0;
    const matchingTags: string[] = [];

    // Calculate score based on matching tags
    userPreferences.forEach((preference) => {
      if (photographerTags.has(preference.tag)) {
        // Weight by both preference score and frequency
        const weightedScore = preference.score * Math.log(preference.count + 1);
        totalScore += weightedScore;
        matchingTags.push(preference.tag);
      }
    });

    return { score: totalScore, matchingTags };
  }

  /**
   * Get personalized photographer recommendations
   */
  async getRecommendations(userId: number): Promise<RecommendationResult[]> {
    try {
      // Get user's tag preferences
      const userPreferences = await this.getUserTagPreferences(userId);

      if (userPreferences.length === 0) {
        // User hasn't rated any photos yet, return random photographers
        const randomPhotographers = await this.photographerRepository
          .createQueryBuilder("photographer")
          .innerJoinAndSelect("photographer.photos", "photos")
          .innerJoinAndSelect("photos.tags", "tags")
          .orderBy("RANDOM()")
          .limit(12)
          .getMany();

        return randomPhotographers.map((photographer) => ({
          photographer,
          similarityScore: 0,
          matchingTags: [],
          explanation:
            "Discover new photographers - start rating photos to get personalized recommendations!",
        }));
      }

      // Get photographers user hasn't interacted with
      const newPhotographers = await this.getNewPhotographers(userId);

      // Calculate similarity scores
      const recommendations: RecommendationResult[] = [];

      newPhotographers.forEach((photographer) => {
        const { score, matchingTags } = this.calculateSimilarityScore(
          userPreferences,
          photographer
        );

        if (score > 0) {
          // Only include photographers with matching tags
          recommendations.push({
            photographer,
            similarityScore: score,
            matchingTags,
            explanation: `Recommended because you like photos tagged: ${matchingTags
              .slice(0, 3)
              .join(", ")}`,
          });
        }
      });

      // Sort by similarity score and return top 12
      return recommendations
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 12);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw new Error("Failed to generate recommendations");
    }
  }
}
