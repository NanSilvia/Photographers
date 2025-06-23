import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Photographer } from "./photographer";
import { Tag } from "./tag";
import { Rating } from "./rating";

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Photographer, (photographer) => photographer.photos)
  photographer: Photographer;

  @Column("varchar", { length: 100 })
  title: string;

  @Column("text")
  description: string;

  @Column("text")
  imageUrl: string;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => Rating, (r) => r.photo)
  ratings: Rating[];
}
