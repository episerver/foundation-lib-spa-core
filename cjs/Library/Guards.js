"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFlattenedProperty = exports.isVerboseProperty = exports.PathResponseIsIContent = exports.PathResponseIsActionResponse = exports.isNetworkError = void 0;
var NetworkErrorData_1 = require("../ContentDelivery/NetworkErrorData");
Object.defineProperty(exports, "isNetworkError", { enumerable: true, get: function () { return NetworkErrorData_1.isNetworkError; } });
var PathResponse_1 = require("../ContentDelivery/PathResponse");
Object.defineProperty(exports, "PathResponseIsActionResponse", { enumerable: true, get: function () { return PathResponse_1.PathResponseIsActionResponse; } });
Object.defineProperty(exports, "PathResponseIsIContent", { enumerable: true, get: function () { return PathResponse_1.PathResponseIsIContent; } });
var Property_1 = require("../Property");
Object.defineProperty(exports, "isVerboseProperty", { enumerable: true, get: function () { return Property_1.isVerboseProperty; } });
Object.defineProperty(exports, "isFlattenedProperty", { enumerable: true, get: function () { return Property_1.isFlattenedProperty; } });
//# sourceMappingURL=Guards.js.map