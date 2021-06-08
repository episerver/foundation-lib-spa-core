"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractIContent = exports.Property = void 0;
const tslib_1 = require("tslib");
// Export Property Namespace
exports.Property = require("../Property");
tslib_1.__exportStar(require("../Models/Language"), exports);
tslib_1.__exportStar(require("../Models/LanguageList"), exports);
tslib_1.__exportStar(require("../Models/Website"), exports);
tslib_1.__exportStar(require("../Models/WebsiteList"), exports);
tslib_1.__exportStar(require("../Models/ContentLink"), exports);
// IContent
var IContent_1 = require("../Models/IContent");
Object.defineProperty(exports, "AbstractIContent", { enumerable: true, get: function () { return IContent_1.BaseIContent; } });
//# sourceMappingURL=Taxonomy.js.map