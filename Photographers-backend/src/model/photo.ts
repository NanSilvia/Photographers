import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Photographer } from "./photographer";

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Photographer, (photographer) => photographer.photos)
    photographer: Photographer

    @Column("varchar", { length: 100 })
    title: string

    @Column("text")
    description: string

    @Column("text")
    imageUrl: string
}