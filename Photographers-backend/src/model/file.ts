import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class File {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column("varchar", { length: 100 })
    originalName: string

    @Column("varchar", { length: 100 })
    mimeType: string

    @Column("bytea")
    buffer: Buffer

    @ManyToOne(()=>User, (user) => user.files)
    user: User

}