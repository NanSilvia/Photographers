import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./user";
import { Photographer } from "./photographer";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Photographer, (photographer) => photographer.comments)
  photographer: Photographer;

  @Column("text")
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
