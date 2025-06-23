import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Photographer } from "./photographer";
import { File } from "./file";
import { Log } from "./log";
import { Notification } from "./notification";
import { Rating } from "./rating";
import { Comment } from "./comment";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 100 })
  @Index()
  username: string;

  @Column("varchar", { length: 256 })
  password: string;

  @Column("varchar", { length: 256 })
  twoFactorSecret: string;

  @Column("varchar", { length: 100 })
  role: string;

  @ManyToMany(() => Photographer, (photographer) => photographer.users, {
    cascade: true,
  })
  @JoinTable()
  photographers: Photographer[];

  @OneToMany(() => File, (file) => file.user, {
    cascade: true,
  })
  files: File[];

  @OneToMany(() => Log, (log) => log.user, {
    cascade: true,
  })
  logs: Log[];

  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable()
  friends: User[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: true,
  })
  notifications: Notification[];

  @OneToMany(() => Rating, (r) => r.user)
  ratings: Rating[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    cascade: true,
  })
  comments: Comment[];
}
