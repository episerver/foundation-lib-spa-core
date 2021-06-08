import { FunctionComponent } from 'react';

import { useEpiserver } from '../Hooks/Context';

const ScriptPath = "episerver/cms/latest/";
const ScriptFile = "clientresources/epi-cms/communicationinjector.js";

export type CmsCommunicatorProps = {
    /**
     * Override the script path for the communicator script
     * 
     * @default episerver/cms/latest/
     */
    scriptPath?: string,

    /**
     * Override the script file for the communicator script
     * 
     * @default clientresources/epi-cms/communicationinjector.js
     */
    scriptFile?: string
};

export const CmsCommunicator : FunctionComponent<CmsCommunicatorProps> = (props) => {
    const context = useEpiserver();
    const myScriptFile = props.scriptFile || ScriptFile;
    const myScriptPath = props.scriptPath || ScriptPath;
    const myScriptUrl = new URL(myScriptPath + myScriptFile, context.getEpiserverURL());

    if ((context.isEditable() || context.isInEditMode()) && (context.isServerSideRendering() || !communicatorLoaded(myScriptFile)))
    {
        if (context.isDebugActive()) console.debug("CmsCommunicator: Updating document domain");
        try {
            const myDomain = document.domain.split('.');
            if (myDomain.length > 2) document.domain = myDomain.slice(myDomain.length - 2).join('.');
        } catch (e) {
            if (context.isDebugActive()) console.error("CmsCommunicator: FAILED Updating document domain", e);
        }
        if (context.isDebugActive()) console.debug("CmsCommunicator: Injecting script");
        try {
            const tag = document.createElement("script");
            tag.src = myScriptUrl.href;
            document.body.appendChild(tag);
        } catch (e) {
            if (context.isDebugActive()) console.error("CmsCommunicator: FAILED Injecting script", e);
        }
    }

    return null;
}

function communicatorLoaded(file: string) : boolean {
    try {
        const scripts = document.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts.item(i);
            if (script?.src && script.src.substr(-1 * file.length) === file)
                return true;
        }
    } catch (e) {
        //Ignore on purpose
    }
    return false;
}

CmsCommunicator.displayName = 'Optimizely CMS: Edit Mode Communicator'

export default CmsCommunicator;