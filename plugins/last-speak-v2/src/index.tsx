import { logger } from "@revenge-mod";
import { patchAsyncComponent } from "@revenge-mod/ui/components";
import { findByDisplayName, findByName } from "@revenge-mod/metro";
import Settings from "./Settings";

export default {
    onLoad: async () => {
        logger.log("Voice Panel plugin loading");
        
        try {
            // Multiple ways to find the component - try them in order
            let VoicePanelCard = await findByDisplayName("VoicePanelCard");
            
            if (!VoicePanelCard?.default) {
                logger.log("Trying findByName...");
                VoicePanelCard = await findByName("VoicePanelCard");
            }

            if (!VoicePanelCard) {
                logger.error("VoicePanelCard not found!");
                return;
            }

            logger.log("Patching VoicePanelCard...");

            // Patch the component
            await patchAsyncComponent(VoicePanelCard, (Component) => {
                return (props) => {
                    const element = Component(props);
                    
                    // Add your custom element to the component tree
                    if (element?.props?.children) {
                        const { Text } = require("@revenge-mod/ui");
                        element.props.children = [
                            <Text size="sm" weight="500">
                                Your Custom Text
                            </Text>,
                            element.props.children
                        ];
                    }
                    
                    return element;
                };
            });

            logger.log("Patch applied!");
        } catch (err) {
            logger.error("Patch failed:", err);
        }
    },

    onUnload: () => {
        logger.log("Plugin unloaded");
    },

    settings: Settings,
}