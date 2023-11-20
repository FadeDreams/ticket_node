import { ItemService, itemService } from "./item/item.service";
import { CreateItemDto, UpdateItemDto, DeleteItemDto, AddImagesDto, DeleteImagesDto } from './dtos/item.dto'
import { BadRequestError, NotAuthorizedError, } from '@fadedreams7pcplatform/common'

export class ProviderService {
  constructor(
    public itemService: ItemService
  ) { }

  async addItem(createItemDto: CreateItemDto) {
    return await this.itemService.create(createItemDto)
  }
}

export const providerService = new ProviderService(itemService)
