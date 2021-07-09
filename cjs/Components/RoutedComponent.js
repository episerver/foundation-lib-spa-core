"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutedComponent = void 0;
const react_1 = require("react");
const Context_1 = require("../Hooks/Context");
const ContentLink_1 = require("../Models/ContentLink");
const EpiComponent_1 = require("./EpiComponent");
const Spinner_1 = require("./Spinner");
const Tools_1 = require("../State/Tools");
const RoutedComponent = (props) => {
    const epi = Context_1.useEpiserver();
    const repo = Context_1.useIContentRepository();
    const ssr = Context_1.useServerSideRendering();
    const path = props.location.pathname;
    const [iContent, setIContent] = react_1.useState(ssr.getIContentByPath(path));
    const debug = epi.isDebugActive();
    // Handle path changes
    react_1.useEffect(() => {
        let isCancelled = false;
        repo.getByRoute(path).then(c => {
            var _a;
            if (isCancelled)
                return;
            epi.setRoutedContent(c || undefined);
            setIContent(c);
            if (typeof ((_a = c === null || c === void 0 ? void 0 : c.language) === null || _a === void 0 ? void 0 : _a.name) == 'string' && c.language.name.length > 0 && c.language.name !== epi.Language) {
                if (debug)
                    console.debug('RoutedComponent.onRoutedContentReceived => Changing language (from, to)', epi.Language, c.language.name);
                Tools_1.setLanguage(c.language.name, epi.getStore());
            }
        });
        return () => { isCancelled = true; epi.setRoutedContent(); };
    }, [path, repo, epi, debug]);
    // Handle content changes
    const lang = epi.Language;
    react_1.useEffect(() => {
        let isCancelled = false;
        if (!iContent)
            return () => { isCancelled = true; };
        const linkId = ContentLink_1.ContentLinkService.createLanguageId(iContent, lang, true);
        const afterPatch = (link, oldValue, newValue) => {
            const itemApiId = ContentLink_1.ContentLinkService.createLanguageId(link, lang, true);
            if (debug)
                console.debug('RoutedComponent.onContentPatched => Checking content ids (link, received)', linkId, itemApiId);
            if (linkId === itemApiId && !isCancelled) {
                if (debug)
                    console.debug('RoutedComponent.onContentPatched => Updating iContent', itemApiId, newValue);
                setIContent(newValue);
            }
        };
        const afterUpdate = (item) => {
            if (!item)
                return;
            const itemApiId = ContentLink_1.ContentLinkService.createLanguageId(item, lang, true);
            if (debug)
                console.debug('RoutedComponent.onContentPatched => Checking content ids (link, received)', linkId, itemApiId);
            if (linkId === itemApiId) {
                if (debug)
                    console.debug('RoutedComponent.onContentUpdated => Updating iContent', itemApiId, item);
                setIContent(item);
            }
        };
        repo.addListener("afterPatch", afterPatch);
        repo.addListener("afterUpdate", afterUpdate);
        return () => {
            isCancelled = true;
            repo.removeListener("afterPatch", afterPatch);
            repo.removeListener("afterUpdate", afterUpdate);
        };
    }, [repo, debug, iContent, lang]);
    if (iContent === null)
        return react_1.default.createElement(Spinner_1.Spinner, null);
    return react_1.default.createElement(EpiComponent_1.IContentRenderer, { data: iContent, path: props.location.pathname });
};
exports.RoutedComponent = RoutedComponent;
exports.RoutedComponent.displayName = "Optimizely CMS: Path IContent resolver";
exports.default = exports.RoutedComponent;
//# sourceMappingURL=RoutedComponent.js.map