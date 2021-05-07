import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: Array<User> = [
    {
      id: 0,
      name: 'zava',
      age: 20,
    },
    {
      id: 1,
      name: 'LG',
      age: 100,
    },
  ];

  create(createUserDto: CreateUserDto): number {
    const id = this.users.length;
    this.users.push({
      id,
      name: createUserDto.name,
      age: createUserDto.age,
    });
    return id;
  }

  findAll(): Array<User> {
    return this.users;
  }

  findOne(id: number): User {
    return this.users[id];
  }

  update(id: number, updateUserDto: UpdateUserDto): void {
    const user = this.users[id];
    Object.assign(user, updateUserDto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
