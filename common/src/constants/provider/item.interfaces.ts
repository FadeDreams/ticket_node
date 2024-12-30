import mongoose from 'mongoose'
import { UserDoc } from '../auth/user.interfaces';

export interface ItemDoc extends mongoose.Document {
  user: UserDoc | string,
  title: string,
  price: number,
  images: { src: string }[]
}

export interface ItemModel extends mongoose.Model<ItemDoc> { }
