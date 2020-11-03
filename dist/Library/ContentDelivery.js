"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_V2 = exports.RepositoryV2 = exports.DefaultAPI = exports.FetchAdapter = exports.PathResponseIsIContent = void 0;
const ContentDeliveryAPI_1 = __importStar(require("../ContentDeliveryAPI"));
const FetchAdapter_1 = __importDefault(require("../FetchAdapter"));
// V2 API Imports
const IContentRepositoryNS = __importStar(require("../Repository/IContentRepository"));
const ContentDeliveryAPI_2 = __importDefault(require("../ContentDelivery/ContentDeliveryAPI"));
exports.PathResponseIsIContent = ContentDeliveryAPI_1.PathResponseIsIContent;
exports.FetchAdapter = FetchAdapter_1.default;
exports.DefaultAPI = ContentDeliveryAPI_1.default;
exports.RepositoryV2 = IContentRepositoryNS.IContentRepository;
exports.API_V2 = ContentDeliveryAPI_2.default;
