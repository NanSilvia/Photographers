import { Grid2 } from "@mui/material";
import usePhotoStore from "../stores/PhotoStore";
import { PhotoCard } from "../components/PhotoCard";
import Photo from "../model/Photo";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default () => {
  const { tagName } = useParams<{ tagName: string }>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { fetchByTagName } = usePhotoStore();

  const fetchPhotosByTag = async (tag: string) => {
    try {
      const fetchedPhotos = await fetchByTagName(tag);
      setPhotos(fetchedPhotos);
    } catch (error) {
      console.error("Error fetching photos by tag:", error);
    }
  };

  // Fetch photos by tag when the component mounts
  useEffect(() => {
    if (tagName) {
      fetchPhotosByTag(tagName);
    }
  }, [tagName, fetchByTagName]);

  return (
    <div>
      <h1>Photos by tag: #{tagName}</h1>
      <Grid2>
        {photos.map((photo) => (
          <PhotoCard photo={photo} key={photo.id} />
        ))}
      </Grid2>
    </div>
  );
};
