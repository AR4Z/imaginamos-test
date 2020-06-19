import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Client } from 'src/clients/client.entity';
import { Technician } from 'src/technicians/technician.entity';

@Entity()
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column({ precision: 6, type: "timestamp", nullable: true })
    waiting_date: Date;

    @Column({ precision: 6, type: "timestamp", nullable: true })
    working_date: Date;

    @Column({ precision: 6, type: "timestamp", nullable: true })
    completed_date: Date;

    @Column()
    rating: number;

    @ManyToOne(type => Client, client => client.services)
    client: Client;

    @ManyToOne(type => Technician, technician => technician.services)
    technician: Technician;
}