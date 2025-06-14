import { AppDataSource } from "../databaseHelper/dataSource";
import { Tag } from "../model/tag";

const tagRepository = AppDataSource.getRepository(Tag);

export const getTagsController = async (req, res) => {
  try {
    const tags = await tagRepository.find({
        select: ["name"],
        order: {
            name: "ASC",
        },
    });
    res.json(tags.map(tag => tag.name));
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

