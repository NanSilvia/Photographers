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

  @Column("text")
  profilepicUrl: string;

  @Column("text")
  description: string;

  @Column("varchar", { length: 100, nullable: true })
  videoId?: string;

  @OneToMany(() => Photo, (photo) => photo.photographer, {
    cascade: true,
  })
  photos: Photo[];

  @ManyToMany(() => User, (user) => user.photographers)
  users: User[];
}
