import { authedFetch } from "../helpers/authedFetch";

export interface RecommendationResult {
  photographer: {
    id: number;
    name: string;
    description: string | null;
    profilePicture: string | null;
    photoCount: number;
    samplePhotos: {
      id: number;
      title: string;
      imageUrl: string;
      description: string;
    }[];
  };
  similarityScore: number;
  matchingTags: string[];
  explanation: string;
}

export interface RecommendationsResponse {
  success: boolean;
  count: number;
  recommendations: RecommendationResult[];
}

export class RecommendationsApi {
  private static baseUrl = "/api/users";

  static async getRecommendations(
    userId: number
  ): Promise<RecommendationsResponse> {
    const response = await authedFetch(
      `${this.baseUrl}/${userId}/recommendations`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch recommendations: ${response.statusText}`
      );
    }

    return response.json();
  }
}
