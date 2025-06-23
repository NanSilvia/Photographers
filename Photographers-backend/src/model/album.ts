import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Photo } from "./photo";
import { Photographer } from "./photographer";

@Entity()
export class Album {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Photographer, (ph) => ph.id)
  photographer: Photographer;

  @ManyToMany(() => Photo, (photo) => photo.id)
  @JoinTable()
  photos: Photo[];

  @Column("varchar", { length: 256 })
  name: string;
}
