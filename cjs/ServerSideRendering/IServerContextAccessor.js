"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Factory = void 0;
const DotNetServerContextAccessor_1 = require("./DotNetServerContextAccessor");
const BrowserServerContextAccessor_1 = require("./BrowserServerContextAccessor");
class Factory {
    static create(execContext, config) {
        let accessor = undefined;
        const matching = this.factories.sort((a, b) => a.sortOrder - b.sortOrder).filter(x => x.test(execContext, config));
        if (matching.length >= 1)
            accessor = new matching[0].accessor(execContext, config);
        if (!accessor)
            throw new Error("No Server Context Accessor loaded");
        return accessor;
    }
}
exports.Factory = Factory;
Factory.factories = [
    {
        sortOrder: 100,
        accessor: DotNetServerContextAccessor_1.default,
        test: (execContext) => execContext.isServerSideRendering
    },
    {
        sortOrder: 1000,
        accessor: BrowserServerContextAccessor_1.default,
        test: (execContext) => !execContext.isServerSideRendering
    }
];
//# sourceMappingURL=IServerContextAccessor.js.map