import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Photo } from "./photo";

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 50, unique: true })
  name: string;

  @ManyToMany(() => Photo, (photo) => photo.tags)
  photos: Photo[];
}
