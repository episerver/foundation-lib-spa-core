"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = exports.Spinner = exports.Site = exports.EpiserverContent = exports.ContentArea = exports.LazyComponent = exports.Link = exports.Property = void 0;
// Components
const Property_1 = __importDefault(require("../Components/Property"));
const Link_1 = __importDefault(require("../Components/Link"));
const LazyComponent_1 = __importDefault(require("../Components/LazyComponent"));
const ContentArea_1 = __importDefault(require("../Components/ContentArea"));
const EpiComponent_1 = __importDefault(require("../Components/EpiComponent"));
const CmsSite_1 = __importDefault(require("../Components/CmsSite"));
const Spinner_1 = __importDefault(require("../Components/Spinner"));
const Page_1 = __importDefault(require("../Page"));
function Property(props) { return Property_1.default(props); }
exports.Property = Property;
exports.Link = Link_1.default;
exports.LazyComponent = LazyComponent_1.default;
exports.ContentArea = ContentArea_1.default;
exports.EpiserverContent = EpiComponent_1.default;
exports.Site = CmsSite_1.default;
exports.Spinner = Spinner_1.default;
exports.Page = Page_1.default;
