import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Photo } from "./photo";
import { User } from "./user";
import { Album } from "./album";
import { Comment } from "./comment";

@Entity()
export class Photographer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 100 })
  name: string;

  @Column("timestamp")
  birth: Date;

  @Column("timestamp", {
    nullable: true,
  })
  death: Date | null;

  @Column("text", { nullable: true })
  profilepicUrl: string | null;

  @Column("text", { nullable: true })
  description: string | null;

  @Column("varchar", { length: 100, nullable: true })
  videoId?: string;

  @OneToMany(() => Photo, (photo) => photo.photographer, {
    cascade: true,
  })
  photos: Photo[];

  @ManyToMany(() => User, (user) => user.photographers)
  users: User[];

  @OneToMany(() => Album, (a) => a.photos)
  albums: Album[];

  @OneToMany(() => Comment, (comment) => comment.photographer, {
    cascade: true,
  })
  comments: Comment[];
}
