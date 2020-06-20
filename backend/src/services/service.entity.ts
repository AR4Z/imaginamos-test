import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, BeforeInsert } from 'typeorm';
import { Client } from 'src/clients/client.entity';
import { Technician } from 'src/technicians/technician.entity';

@Entity()
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column({default: () => 'now()' })
    waiting_date: Date;

    @Column({ type: "timestamp", nullable: true })
    working_date: Date;

    @Column({ type: "timestamp", nullable: true })
    completed_date: Date;

    @Column({ nullable: true })
    rating: number;

    @ManyToOne(type => Client, client => client.services)
    client: Client;

    @ManyToOne(type => Technician, technician => technician.services)
    technician: Technician;
}