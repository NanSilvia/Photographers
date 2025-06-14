import { Tag } from "@mui/icons-material";
import TagList from "../components/TagList";
import { useEffect, useState } from "react";

export default () => {
  const [tags, setTags] = useState<string[]>([]);
  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl mb-4">All the tags</h1>
      <TagList tags={tags} />
    </div>
  );
};
