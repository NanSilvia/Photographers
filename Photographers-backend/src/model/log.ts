import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Log {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.logs, {
        nullable: true,
    })
    user?: User;

    @Column("varchar", { length: 256 })
    action: string;

    @Column("timestamp")
    timestamp: Date;
}