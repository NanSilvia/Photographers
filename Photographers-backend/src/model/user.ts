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

  @OneToMany(() => Photographer, (photographer) => photographer.user, {
    cascade: true,
  })
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
}
