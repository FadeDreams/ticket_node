
import mongoose from 'mongoose'
import { CartDoc, CartModel } from '@fadedreams7org1/common'

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CartItem"
        }
    ],
    totalPrice: { type: Number, default: 0, required: true },

    customer_id: { type: String }
})

export const Cart = mongoose.model<CartDoc, CartModel>('Cart', schema);
