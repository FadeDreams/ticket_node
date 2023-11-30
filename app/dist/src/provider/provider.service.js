"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerService = exports.ProviderService = void 0;
const item_service_1 = require("./item/item.service");
const common_1 = require("@fadedreams7pcplatform/common");
class ProviderService {
    constructor(itemService) {
        this.itemService = itemService;
    }
    addItem(createItem) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.itemService.create(createItem);
        });
    }
    updateItem(updateItem) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.itemService.getOneById(updateItem.itemId);
            if (!item)
                return new common_1.BadRequestError('item not found!');
            if (item.user.toString() !== updateItem.userId) {
                return new common_1.NotAuthorizedError();
            }
            return yield this.itemService.updateItem(updateItem);
        });
    }
    deleteItem(deleteItem) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.itemService.getOneById(deleteItem.itemId);
            if (!item)
                return new common_1.BadRequestError('item not found!');
            if (item.user.toString() !== deleteItem.userId) {
                return new common_1.NotAuthorizedError();
            }
            return yield this.itemService.deleteItem(deleteItem);
        });
    }
    addItemImages(addImagesDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.itemService.getOneById(addImagesDto.itemId);
            if (!item)
                return new common_1.BadRequestError('item not found!');
            if (item.user.toString() !== addImagesDto.userId) {
                return new common_1.NotAuthorizedError();
            }
            return yield this.itemService.addImages(addImagesDto);
        });
    }
    deleteItemImages(deleteImages) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.itemService.getOneById(deleteImages.itemId);
            if (!item)
                return new common_1.BadRequestError('item not found!');
            if (item.user.toString() !== deleteImages.userId) {
                return new common_1.NotAuthorizedError();
            }
            return yield this.itemService.deleteImages(deleteImages);
        });
    }
}
exports.ProviderService = ProviderService;
exports.providerService = new ProviderService(item_service_1.itemService);
