"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import libraries
var react_1 = __importStar(require("react"));
var react_helmet_1 = require("react-helmet");
var react_redux_1 = require("react-redux");
//import { BrowserRouter as Router } from 'react-router-dom';
// Import Episerver CMS
var Layout_1 = __importDefault(require("./Layout"));
var IContent_1 = require("../Repository/IContent");
var Spinner_1 = __importDefault(require("./Spinner"));
var IServiceContainer_1 = require("../Core/IServiceContainer");
var EpiSpaRouter = __importStar(require("../Routing/EpiSpaRouter"));
/**
 * CmsSite Container component
 */
var CmsSite = /** @class */ (function (_super) {
    __extends(CmsSite, _super);
    function CmsSite(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            isInitializing: false
        };
        return _this;
    }
    CmsSite.prototype.componentDidMount = function () {
        var _this = this;
        if (this.isStateValid())
            return;
        this.setState({ isInitializing: true });
        this.initializeWebsiteAndPage().finally(function () {
            _this.setState({ isInitializing: false });
        });
    };
    CmsSite.prototype.initializeWebsiteAndPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var me, ws, c, cPath, cPage, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        me = this;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.props.context.loadCurrentWebsite()];
                    case 2:
                        ws = _a.sent();
                        return [4 /*yield*/, me.props.context.loadContentByRef("startPage")];
                    case 3:
                        c = _a.sent();
                        me.props.context.dispatch(IContent_1.IContentActionFactory.registerPaths(c, ['/']));
                        cPath = me.props.context.getCurrentPath();
                        if (!!(cPath === '/' || cPath === c.contentLink.url)) return [3 /*break*/, 5];
                        return [4 /*yield*/, me.props.context.loadContentByPath(cPath)];
                    case 4:
                        cPage = _a.sent();
                        if (cPage.contentLink.url !== cPath) {
                            me.props.context.dispatch(IContent_1.IContentActionFactory.registerPaths(cPage, [cPath]));
                        }
                        _a.label = 5;
                    case 5: return [2 /*return*/, true];
                    case 6:
                        e_1 = _a.sent();
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CmsSite.prototype.render = function () {
        if (!this.isStateValid()) {
            return Spinner_1.default.CreateInstance({});
        }
        var config = this.props.context.serviceContainer.getService(IServiceContainer_1.DefaultServices.Config);
        var props = { context: this.props.context };
        var MyLayout = this.getLayout();
        if (this.props.context.isServerSideRendering()) {
            if (this.props.context.isDebugActive())
                console.log(' - Server side: building layout props');
            props = __assign(__assign({}, props), { path: this.props.context.getCurrentPath(), page: this.props.context.getRoutedContent().contentLink, expandedValue: this.props.context.getRoutedContent(), startPage: this.props.context.getContentByRef('startPage') });
        }
        else {
            if (this.props.context.isDebugActive())
                console.log(' - Browser side: connecting layout');
            MyLayout = react_redux_1.connect(this.buildLayoutPropsFromState.bind(this))(MyLayout);
        }
        return react_1.default.createElement(react_redux_1.Provider, { store: this.props.context.getStore() },
            react_1.default.createElement(EpiSpaRouter.Router, null,
                react_1.default.createElement(react_helmet_1.Helmet, null),
                react_1.default.createElement(MyLayout, __assign({}, props),
                    react_1.default.createElement(EpiSpaRouter.RoutedContent, { config: config.routes || [], keyPrefix: "CmsSite-RoutedContent" }),
                    this.props.children)));
    };
    CmsSite.prototype.buildLayoutPropsFromState = function (state, ownProps) {
        try {
            var path = state.ViewContext.currentPath;
            var idx = state.iContentRepo.paths[path];
            if (!idx) {
                return __assign(__assign({}, ownProps), { path: path, page: undefined, expandedValue: undefined, startPage: undefined });
            }
            var contentLink = void 0;
            var contentItem = void 0;
            var startPage = void 0;
            contentItem = state.iContentRepo.items[idx].content;
            contentLink = contentItem.contentLink;
            var startIdx = state.iContentRepo.refs.startPage;
            if (startIdx && state.iContentRepo.items[startIdx]) {
                startPage = state.iContentRepo.items[startIdx].content;
            }
            var newProps = __assign(__assign({}, ownProps), { page: contentLink, expandedValue: contentItem, path: path,
                startPage: startPage });
            return newProps;
        }
        catch (e) {
            // Ignore layout property building errors
        }
        return ownProps;
    };
    CmsSite.prototype.isStateValid = function () {
        return this.state.isInitializing === false && this.hasWebsite() && this.hasStartPage();
    };
    CmsSite.prototype.hasStartPage = function () {
        return this.props.context.getContentByRef('startPage') ? true : false;
    };
    CmsSite.prototype.hasWebsite = function () {
        return this.props.context.getCurrentWebsite() ? true : false;
    };
    CmsSite.prototype.hasPath = function () {
        var isPath = false;
        try {
            var p = this.props.context.getCurrentPath();
            isPath = typeof (p) === "string" && p.length >= 0;
        }
        catch (e) {
            return false;
        }
        return isPath;
    };
    /**
     * Retrieve the Layout from the the current context of the CMS Site
     */
    CmsSite.prototype.getLayout = function () {
        if (this.props.context.config().layout) {
            return this.props.context.config().layout;
        }
        return Layout_1.default;
    };
    return CmsSite;
}(react_1.Component));
exports.default = CmsSite;
