import Photo from "./Photo";
import Photographer from "./Photographer";

export default interface Album {
  id: number;
  name: string;
  photographer: Photographer;
  photos: Photo[];
}
