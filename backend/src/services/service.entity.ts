import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, BeforeInsert } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Technician } from '../technicians/technician.entity';

@Entity()
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    // Date and time the service was assigned
    @Column({default: () => 'now()' })
    waiting_date: Date;

    // Date and time the assigned technician started working on it
    @Column({ type: "timestamp", nullable: true })
    working_date: Date;

    // Date and time the assigned technician finished its work
    @Column({ type: "timestamp", nullable: true })
    completed_date: Date;

    // customer feedback [0, 5]
    @Column({ nullable: true })
    rating: number;

    @ManyToOne(type => Client, client => client.services)
    client: Client;

    @ManyToOne(type => Technician, technician => technician.services)
    technician: Technician;
}