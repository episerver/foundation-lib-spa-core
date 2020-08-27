#!/usr/bin/env node
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
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var dotenv_1 = __importDefault(require("dotenv"));
var axios_1 = __importDefault(require("axios"));
var StringUtils_1 = __importDefault(require("../Util/StringUtils"));
/**
 * Episerver Model Synchronization Job
 */
var EpiModelSync = /** @class */ (function () {
    /**
     * Create a new instance of the job
     *
     * @param {string} spaDir       The directory where the SPA is located
     * @param {string} envFile      The environment file to use as configuration source
     */
    function EpiModelSync(spaDir, envFile) {
        this._servicePath = 'api/episerver/v3/model';
        this._iContentProps = ["contentLink"];
        if (!fs_1.default.existsSync(spaDir))
            throw new Error("SPA Directory not found");
        if (!fs_1.default.existsSync(envFile))
            throw new Error(".env File not found");
        this._rootDir = spaDir;
        this._config = dotenv_1.default.parse(fs_1.default.readFileSync(envFile));
    }
    /**
     * Run the configuration job
     */
    EpiModelSync.prototype.run = function () {
        console.log('***** Start: Episerver IContent Model Synchronization *****');
        console.log(' - Using Episerver installed at: ' + this._config.EPI_URL);
        console.log(' - Ensuring models directory exists (' + this.getModelPath() + ')');
        console.log(' - Retrieving content types');
        var me = this;
        this._doRequest(this.getServiceUrl()).then(function (r) {
            if (!r)
                return;
            var modelNames = r.map(function (x) { return x.Name; });
            me.clearModels(modelNames.map(function (x) { return me.getModelInterfaceName(x); }));
            console.log(' - Start creating/updating model definitions');
            modelNames.forEach(function (model) { return me.createModelFile(model, modelNames); });
            me.createAsyncTypeMapper(modelNames);
        }).catch(function (reason) { return console.log(reason); });
    };
    /**
     * Generate a TypeMapper component which enables loading of the types from Episerver
     *
     * @protected
     * @param {string[]} allItemNames The model names fetched from Episerver
     * @returns {void}
     */
    EpiModelSync.prototype.createAsyncTypeMapper = function (allItemNames) {
        var _this = this;
        var mapperFile = path_1.default.join(this.getModelPath(), 'TypeMapper.ts');
        var mapper = "import { IContentType } from '@episerver/spa-core/Models/IContent';\nimport EpiserverSpaContext from '@episerver/spa-core/Spa';\n";
        mapper += "import BaseTypeMapper, { TypeMapperTypeInfo } from '@episerver/spa-core/Loaders/BaseTypeMapper'\n;";
        // allItemNames.forEach(x => mapper += "import {"+this.getModelInstanceName(x)+"} from './"+ this.getModelInterfaceName(x)+"';\n")
        mapper += "\nexport default class TypeMapper extends BaseTypeMapper {\n";
        mapper += "  protected map : { [type: string]: TypeMapperTypeInfo } = {\n";
        allItemNames.forEach(function (x) { return mapper += "    '" + x + "': {dataModel: '" + _this.getModelInterfaceName(x) + "',instanceModel: '" + _this.getModelInstanceName(x) + "'},\n"; });
        mapper += "  }\n";
        mapper += "  protected async doLoadType(typeInfo: TypeMapperTypeInfo) : Promise<IContentType> {\n";
        mapper += "    return import(\n";
        mapper += "    /* webpackInclude: /\\.ts$/ */\n";
        mapper += "    /* webpackExclude: /\\.noimport\\.ts$/ */\n";
        mapper += "    /* webpackChunkName: \"types\" */\n";
        mapper += "    /* webpackMode: \"lazy-once\" */\n";
        mapper += "    /* webpackPrefetch: true */\n";
        mapper += "    /* webpackPreload: false */\n";
        mapper += "    \"./\" + typeInfo.dataModel).then(exports => {\n";
        mapper += "      return exports[typeInfo.instanceModel];\n";
        mapper += "    }).catch(reason => {\n";
        mapper += "      if (EpiserverSpaContext.isDebugActive()) {\n";
        mapper += "        console.error(`Error while importing ${typeInfo.instanceModel} from ${typeInfo.dataModel} due to:`, reason);\n";
        mapper += "      }\n";
        mapper += "      return null;\n";
        mapper += "    });\n";
        mapper += "  }\n";
        mapper += "}\n";
        fs_1.default.writeFile(mapperFile, mapper, function () {
            console.log(' - Written type mapper');
        });
    };
    /**
     * Create a model file for the specified type
     *
     * @protected
     * @param {string}      typeName
     * @param {string[]}    allItemNames
     * @param {void}
     */
    EpiModelSync.prototype.createModelFile = function (typeName, allItemNames) {
        // console.log('   - Fetching model definition for '+typeName);
        var me = this;
        this._doRequest(this.getServiceUrl(typeName)).then(function (info) {
            if (!info)
                return;
            var interfaceName = me.getModelInterfaceName(info.Name);
            var propsInterfaceName = me.getComponentPropertiesInterfaceName(info.Name);
            var instanceName = me.getModelInstanceName(info.Name);
            var fileName = interfaceName + ".ts";
            // Imports
            var iface = "import { ContentDelivery, Taxonomy, ComponentTypes } from '@episerver/spa-core'\n";
            // Heading
            iface += "/**\n * " + (info.DisplayName ? info.DisplayName : info.Name) + "\n *\n * " + (info.Description ? info.Description : "No Description available.") + "\n *\n * @GUID " + info.GUID + "\n */\n";
            // Actual interface
            iface += "export default interface " + interfaceName + " extends Taxonomy.IContent {\n";
            info.Properties.forEach(function (prop) {
                var propName = me.processFieldName(prop.Name);
                if (!me._iContentProps.includes(propName)) {
                    iface += "    /**\n     * " + (prop.DisplayName ? prop.DisplayName : prop.Name) + "\n     *\n     * " + (prop.Description ? prop.Description : "No description available") + "\n     */\n";
                    iface += "    " + propName + ": " + me.ConvertTypeToSpaProperty(prop.Type, allItemNames) + "\n\n";
                    if (allItemNames.includes(prop.Type)) {
                        iface = "import " + prop.Type + "Data from './" + prop.Type + "Data'\n" + iface;
                    }
                }
            });
            iface += "}\n\n";
            // Convenience interface
            iface += "/**\n * Convenience interface for componentDidUpdate & componentDidMount methods.\n */\n";
            iface += "export interface " + propsInterfaceName + " extends ComponentTypes.AbstractComponentProps<" + interfaceName + "> {}\n\n";
            // Instance type
            iface += "export class " + instanceName + " extends Taxonomy.AbstractIContent<" + interfaceName + "> implements " + interfaceName + " {\n";
            iface += "    protected _typeName : string = \"" + info.Name + "\";\n";
            iface += "    /**\n     * Map of all property types within this content type.\n     */\n";
            iface += "    protected _propertyMap : { [propName: string]: string } = {\n";
            info.Properties.forEach(function (prop) {
                var propName = me.processFieldName(prop.Name);
                iface += "        '" + propName + "': '" + prop.Type + "',\n";
            });
            iface += "    }\n\n";
            info.Properties.forEach(function (prop) {
                var propName = me.processFieldName(prop.Name);
                if (!me._iContentProps.includes(propName)) {
                    iface += "    /**\n     * " + (prop.DisplayName ? prop.DisplayName : prop.Name) + "\n     *\n     * " + (prop.Description ? prop.Description : "No description available") + "\n     */\n";
                    iface += "    public get " + propName + "() : " + interfaceName + "[\"" + propName + "\"] { return this.getProperty(\"" + propName + "\"); }\n\n";
                }
            });
            iface += "}\n";
            // Write interface
            var fullTarget = path_1.default.join(me.getModelPath(), fileName);
            fs_1.default.writeFile(fullTarget, iface, function () {
                console.log("   - " + interfaceName + " written to " + fullTarget);
            });
        });
    };
    /**
     * Convert the reported model type to a TypeScript type
     *
     * @protected
     * @param {string}      typeName        The name of the type
     * @param {string[]}    allItemNames    The list of types in Episerver (for property blocks)
     * @returns {string}
     */
    EpiModelSync.prototype.ConvertTypeToSpaProperty = function (typeName, allItemNames) {
        switch (typeName) {
            case "Boolean":
                return "ContentDelivery.BooleanProperty";
            case "Decimal":
            case "Number":
            case "FloatNumber":
                return "ContentDelivery.NumberProperty";
            case "String":
            case "string":
            case "LongString":
            case "XhtmlString":
            case "Url":
                return "ContentDelivery.StringProperty";
            case "ContentReference":
            case "PageReference":
                return "ContentDelivery.ContentReferenceProperty";
            case "ContentReferenceList":
                return "ContentDelivery.ContentReferenceListProperty";
            case "ContentArea":
                return "ContentDelivery.ContentAreaProperty";
            case "LinkCollection":
                return "ContentDelivery.LinkListProperty";
            default:
                if (allItemNames.includes(typeName)) {
                    return typeName + "Data";
                }
                return "ContentDelivery.Property<any> // Original type: " + typeName;
        }
    };
    /**
     * Remove all models from the models folder, except thos explicitly kept
     *
     * @protected
     * @param {string[]} keep The model names to keep in the output folder
     */
    EpiModelSync.prototype.clearModels = function (keep) {
        console.log(' - Cleaning model directory');
        var modelPath = this.getModelPath();
        var files = fs_1.default.readdirSync(modelPath);
        files.forEach(function (file) {
            var name = path_1.default.parse(file).name;
            if (name !== "TypeMapper" && keep && !keep.includes(name)) {
                console.log('  - Removing old model: ', name);
                fs_1.default.unlinkSync(path_1.default.join(modelPath, file));
            }
        });
    };
    /**
     * Build the service path within Episerver to fetch the model
     *
     * @protected
     * @param {string} modelName The name of the model
     * @returns {string}
     */
    EpiModelSync.prototype.getServiceUrl = function (modelName) {
        return this._servicePath + (modelName ? '/' + modelName : '');
    };
    /**
     * Get (and create if needed) the path where the models must be stored
     *
     * @protected
     * @returns {string}
     */
    EpiModelSync.prototype.getModelPath = function () {
        if (!this._config.EPI_MODEL_PATH) {
            throw new Error('Episerver models directory not set');
        }
        var modelPath = path_1.default.join(this._rootDir, this._config.EPI_MODEL_PATH);
        if (!fs_1.default.existsSync(modelPath)) {
            fs_1.default.mkdirSync(modelPath, { "recursive": true });
        }
        return modelPath;
    };
    /**
     * Generate the TypeScript interface name
     *
     * @protected
     * @param {string} modelName    The name of the model in Episerver
     * @returns {string}
     */
    EpiModelSync.prototype.getModelInterfaceName = function (modelName) {
        return StringUtils_1.default.SafeModelName(modelName) + 'Data';
    };
    /**
     * Generate the TypeScript instance name
     *
     * @protected
     * @param {string} modelName    The name of the model in Episerver
     * @returns {string}
     */
    EpiModelSync.prototype.getModelInstanceName = function (modelName) {
        return StringUtils_1.default.SafeModelName(modelName) + 'Type';
    };
    /**
     * Generate the TypeScript interface name
     *
     * @protected
     * @param {string} modelName    The name of the model in Episerver
     * @return {string}
     */
    EpiModelSync.prototype.getComponentPropertiesInterfaceName = function (modelName) {
        return StringUtils_1.default.SafeModelName(modelName) + 'Props';
    };
    EpiModelSync.prototype.processFieldName = function (originalName) {
        var processedName = originalName;
        processedName = processedName.charAt(0).toLowerCase() + processedName.slice(1);
        return processedName;
    };
    EpiModelSync.prototype._doRequest = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, reason_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.request({
                                method: 'get',
                                baseURL: this._config.EPI_URL,
                                url: url,
                                headers: {
                                    Authorization: 'Bearer ' + (this._config.EPI_MODEL_DEV_KEY ? this._config.EPI_MODEL_DEV_KEY : '-'),
                                    Accept: 'application/json'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        reason_1 = _a.sent();
                        console.log('Error while fetching (url, reason)', url, reason_1);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/, response.data];
                }
            });
        });
    };
    return EpiModelSync;
}());
var cwd = process.cwd();
var configFile = path_1.default.join(cwd, ".env");
var sync = new EpiModelSync(cwd, configFile);
sync.run();
