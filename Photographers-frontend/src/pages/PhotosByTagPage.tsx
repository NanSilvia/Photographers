import {
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import usePhotoStore from "../stores/PhotoStore";
import { PhotoCard } from "../components/PhotoCard";
import Photo from "../model/Photo";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Dropdown } from "@mui/joy";

export default () => {
  const { tagName } = useParams<{ tagName: string }>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [sortOrder, setSortOrder] = useState("none");
  const { fetchByTagName } = usePhotoStore();

  const fetchPhotosByTag = async (tag: string, sort: string) => {
    try {
      const fetchedPhotos = await fetchByTagName(tag);
      if (sort === "asc") {
        fetchedPhotos.sort((a: Photo, b: Photo) => {
          const ratingA =
            a.ratings.reduce((u, rating) => u + rating.rating, 0) /
            Math.max(a.ratings.length, 1);
          const ratingB =
            b.ratings.reduce((u, rating) => u + rating.rating, 0) /
            Math.max(b.ratings.length, 1);
          return ratingA - ratingB;
        });
      } else if (sort === "desc") {
        fetchedPhotos.sort((a: Photo, b: Photo) => {
          const ratingA =
            a.ratings.reduce((u, rating) => u + rating.rating, 0) /
            Math.max(a.ratings.length, 1);
          const ratingB =
            b.ratings.reduce((u, rating) => u + rating.rating, 0) /
            Math.max(b.ratings.length, 1);
          return ratingB - ratingA;
        });
      }

      setPhotos(fetchedPhotos);
    } catch (error) {
      console.error("Error fetching photos by tag:", error);
    }
  };

  // Fetch photos by tag when the component mounts
  useEffect(() => {
    if (tagName) {
      fetchPhotosByTag(tagName, sortOrder);
    }
  }, [tagName, sortOrder, fetchByTagName]);
  const onTagSortChange = (event: SelectChangeEvent<string>) => {
    setSortOrder(event.target.value);
  };
  return (
    <div>
      <h1>Photos by tag: #{tagName}</h1>
      <InputLabel id="tag-select">Sort</InputLabel>

      <Select
        labelId="tag-select"
        id="tag-select"
        value={sortOrder}
        label="Sort"
        onChange={onTagSortChange}
      >
        <MenuItem value={"asc"}> Ascending</MenuItem>
        <MenuItem value={"desc"}> Descending</MenuItem>
        <MenuItem value={"none"}> No filtering</MenuItem>
      </Select>
      <Grid2>
        {photos.map((photo) => (
          <PhotoCard photo={photo} key={photo.id} />
        ))}
      </Grid2>
    </div>
  );
};
