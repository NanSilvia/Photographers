import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class File {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column("varchar", { length: 100 })
    originalName: string

    @Column("varchar", { length: 100 })
    mimeType: string

    @Column("mediumblob")
    buffer: Buffer
}