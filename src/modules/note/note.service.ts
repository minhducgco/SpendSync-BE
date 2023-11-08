import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { GetNoteDto } from './dto/get-note.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note, NoteDocument } from './schemas/note.schema';
import { ResPagingDto } from 'src/shares/dtos/pagination.dto';

@Injectable()
export class NoteService {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  async find(getNoteDto: GetNoteDto, user_id: string): Promise<ResPagingDto<Note[]>> {
    const { sort, page, limit, title } = getNoteDto;
    const query: any = {};
    query.user_id = user_id;
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    const [result, total] = await Promise.all([
      this.noteModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: sort }),
      this.noteModel.find(query).countDocuments(),
    ]);
    return {
      result,
      total,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Note> {
    return this.noteModel.findOne({ _id: id });
  }

  async create(payload: CreateNoteDto, create_by: string): Promise<void> {
    console.log({ ...payload, user_id: create_by })
    await this.noteModel.create({ ...payload, user_id: create_by });
  }
}