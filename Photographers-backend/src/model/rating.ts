import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Photo } from "./photo";
import { User } from "./user";

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.id)
  user: User;

  @ManyToOne(() => Photo, (p) => p.id)
  photo: Photo;

  @Column("int")
  rating: number;
}
