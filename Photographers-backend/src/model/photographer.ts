import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Photo } from "./photo";

@Entity()
export class Photographer {
    @PrimaryGeneratedColumn()
    id: number

    @Column("varchar", { length: 100 })
    name: string

    @Column("datetime")
    birth: Date

    @Column("datetime",{
        nullable: true,
    })
    death: Date | null

    @Column("text")
    profilepicUrl: string

    @Column("text")
    description: string

    @Column("varchar", { length: 100, nullable: true })
    videoId?: string

    @OneToMany(() => Photo, (photo) => photo.photographer, {
        cascade: true,

    })
    photos: Photo[]
}