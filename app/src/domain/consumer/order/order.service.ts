
import { OrderModel } from '@fadedreams7org1/common'
import { Order } from './order.model'
import { CreateOrderDto } from '../dtos/order.dto'

export class OrderService {
    constructor(
        public orderModel: OrderModel
    ) { }

    async createOrder(createOrder: CreateOrderDto) {
        const order = new this.orderModel({
            user: createOrder.userId,
            totalAmount: createOrder.totalAmount,
            chargeId: createOrder.chargeId
        })

        return await order.save()
    }
}

export const orderService = new OrderService(Order)
