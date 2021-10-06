import { useEffect } from 'react';
import { useEpiserver } from '../Hooks/Context';
const ScriptPath = "episerver/cms/latest/";
const ScriptFile = "clientresources/epi-cms/communicationinjector.js";
export const CmsCommunicator = (props) => {
    const context = useEpiserver();
    const myScriptFile = props.scriptFile || ScriptFile;
    const myScriptPath = props.scriptPath || ScriptPath;
    const myScriptUrl = context.getEpiserverUrl(myScriptPath + myScriptFile);
    const shouldLoadScript = (context.isEditable() || context.isInEditMode()) && !context.isServerSideRendering();
    const scriptHrf = myScriptUrl.href;
    if (context.isEditable() || context.isInEditMode()) {
        if (context.isDebugActive())
            console.debug("CmsCommunicator: Updating document domain");
        try {
            const myDomain = document.domain.split('.');
            if (myDomain.length > 2)
                document.domain = myDomain.slice(myDomain.length - 2).join('.');
        }
        catch (e) {
            if (context.isDebugActive())
                console.error("CmsCommunicator: FAILED Updating document domain", e);
        }
    }
    useEffect(() => {
        if (!shouldLoadScript)
            return;
        let scriptTag;
        // Script injection function
        const injectScript = () => {
            if (document.readyState != "complete")
                return;
            scriptTag = document.createElement('script');
            scriptTag.src = scriptHrf;
            document.body.appendChild(scriptTag);
        };
        // Start listening for ReadyState changes
        document.addEventListener('readystatechange', injectScript);
        // Ensure we still inject the script if the ReadyState is already complete when we run the first time
        if (!scriptTag && document.readyState == 'complete')
            injectScript();
        // Remove all we did
        return () => {
            document.removeEventListener('readystatechange', injectScript);
            if (scriptTag)
                document.body.removeChild(scriptTag);
        };
    }, [shouldLoadScript, scriptHrf]);
    return null;
};
function communicatorLoaded(file) {
    try {
        const scripts = document.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts.item(i);
            if (script?.src && script.src.toLowerCase().substr(-1 * file.length) === file.toLowerCase())
                return true;
        }
    }
    catch (e) {
        //Ignore on purpose
    }
    return false;
}
CmsCommunicator.displayName = 'Optimizely CMS: Edit Mode Communicator';
export default CmsCommunicator;
//# sourceMappingURL=CmsCommunicator.js.map