import Photographer from "./Photographer";
import Rating from "./Rating";

export default interface Photo {
  id: number;
  photographer: Photographer;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  ratings: Rating[];
}
