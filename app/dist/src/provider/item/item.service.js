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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemService = exports.ItemService = void 0;
const common_1 = require("@fadedreams7pcplatform/common");
const item_model_1 = require("./item.model");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ItemService {
    constructor(itemModel) {
        this.itemModel = itemModel;
    }
    getOneById(itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.itemModel.findById(itemId);
        });
    }
    create(createItemDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const images = this.generateItemImages(createItemDto.files);
            const item = new this.itemModel({
                title: createItemDto.title,
                price: createItemDto.price,
                user: createItemDto.userId,
                images: images
            });
            return yield item.save();
        });
    }
    updateItem(updateItem) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.itemModel.findOneAndUpdate({ _id: updateItem.itemId }, { $set: { title: updateItem.title, price: updateItem.price } }, { new: true });
        });
    }
    deleteItem(deleteItemDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.itemModel.findOneAndDelete({ _id: deleteItemDto.itemId });
        });
    }
    addImages(addImages) {
        return __awaiter(this, void 0, void 0, function* () {
            const images = this.generateItemImages(addImages.files);
            return yield this.itemModel.findOneAndUpdate({ _id: addImages.itemId }, { $push: { images: { $each: images } } }, { new: true });
        });
    }
    deleteImages(deleteImages) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.itemModel.findOneAndUpdate({ _id: deleteImages.itemId }, { $pull: { images: { _id: { $in: deleteImages.imagesIds } } } }, { new: true });
        });
    }
    generateBase64Url(contentType, buffer) {
        return `data:${contentType};base64,${buffer.toString('base64')}`;
    }
    generateItemImages(files) {
        let images;
        if (typeof files === "object") {
            images = Object.values(files).flat();
        }
        else {
            images = files ? [...files] : [];
        }
        return images.map((file) => {
            let srcObj = { src: this.generateBase64Url(file.mimetype, fs_1.default.readFileSync(path_1.default.join(common_1.uploadDir + file.filename))) };
            fs_1.default.unlink(path_1.default.join(common_1.uploadDir + file.filename), () => { });
            return srcObj;
        });
    }
}
exports.ItemService = ItemService;
exports.itemService = new ItemService(item_model_1.Item);
