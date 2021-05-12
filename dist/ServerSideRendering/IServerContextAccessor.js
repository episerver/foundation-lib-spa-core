import DotNetServerContextAccessor from './DotNetServerContextAccessor';
import BrowserServerContextAccessor from './BrowserServerContextAccessor';
export class Factory {
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
Factory.factories = [
    {
        sortOrder: 100,
        accessor: DotNetServerContextAccessor,
        test: (execContext) => execContext.isServerSideRendering
    },
    {
        sortOrder: 1000,
        accessor: BrowserServerContextAccessor,
        test: (execContext) => !execContext.isServerSideRendering
    }
];
//# sourceMappingURL=IServerContextAccessor.js.map