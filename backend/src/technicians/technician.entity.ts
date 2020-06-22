import { Entity, Column, PrimaryGeneratedColumn, OneToMany, BeforeInsert } from 'typeorm';
import { Service } from '../services/service.entity';
import * as bcrypt from 'bcryptjs';

@Entity()
export class Technician {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @OneToMany(type => Service, service => service.technician)
  services: Service[];

  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 10);
  }

  async comparePassword(attempt: string, password: string): Promise<boolean> {
    return await bcrypt.compareSync(attempt, password);
  }
}