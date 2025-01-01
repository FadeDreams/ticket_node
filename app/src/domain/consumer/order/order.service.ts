
import { OrderModel } from '@fadedreams7org1/common'
import { Order } from '@src/domain/consumer/order/order.model.ts'
import { CreateOrderDto } from '@src/domain/consumer/dtos/order.dto.ts'

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
