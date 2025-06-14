import { Tag } from "./tag";
import { AppDataSource } from "../databaseHelper/dataSource";
import { In, IsNull } from "typeorm";

const tagsRepo = AppDataSource.getRepository(Tag);
// Get all tags and remove the tags that are not used in any photo from the db
export async function getAllUsedTags(): Promise<Tag[]> {
    const usedTags = await tagsRepo
        .createQueryBuilder("tag")
        .leftJoinAndSelect("tag.photos", "photo")
        .where("photo.id IS NOT NULL")
        .getMany();

    // Remove tags that are not used in any photo
    const unusedTags = await tagsRepo.find({
        where: {
            photos: IsNull(),
        },
    });

    if (unusedTags.length > 0) {
        await tagsRepo.remove(unusedTags);
    }

    return usedTags;
}
// Get entites from a list of tag names create tags if they do not exist
export async function getTagsByNames(tagNames: string[]): Promise<Tag[]> {
    const existingTags = await tagsRepo.find({
        where: {
            name: In(tagNames),
        },
    });

    const existingTagNames = existingTags.map(tag => tag.name);
    const newTagNames = tagNames.filter(name => !existingTagNames.includes(name));

    const newTags = newTagNames.map(name => {
        const tag = new Tag();
        tag.name = name;
        return tag;
    });

    if (newTags.length > 0) {
        await tagsRepo.save(newTags);
    }

    return [...existingTags, ...newTags];
}
