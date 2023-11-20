
import mongoose from 'mongoose'
import { ItemDoc, ItemModel } from '@fadedreams7pcplatform/common'

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  images: [
    {
      src: { type: String, required: true }
    }
  ]
})

export const Item = mongoose.model<ItemDoc, ItemModel>('Item', schema);
