import { logger } from "@vendetta";
import { patchAsyncComponent } from "@vendetta/ui/components";
import { findByDisplayName } from "@vendetta/metro";
import Settings from "./Settings";

export default {
    onLoad: async () => {
        logger.log("Voice Panel plugin loading");
        
        try {
            // Find VoicePanelCard component
            const VoicePanelCard = findByDisplayName("VoicePanelCard");
            
            if (!VoicePanelCard) {
                logger.error("Could not find VoicePanelCard");
                return;
            }

            logger.log("Found VoicePanelCard, patching...");

            // Patch the component
            patchAsyncComponent(
                VoicePanelCard,
                (Component) => {
                    return (props) => {
                        const original = Component(props);
                        
                        // Inject text above existing content
                        if (original?.props?.children) {
                            const customContent = {
                                type: "Text",
                                props: {
                                    children: "In Voice Chat",
                                    size: 12,
                                    color: "white",
                                    style: { marginBottom: 8 }
                                }
                            };
                            
                            const currentChildren = Array.isArray(original.props.children)
                                ? original.props.children
                                : [original.props.children];
                            
                            original.props.children = [customContent, ...currentChildren];
                        }
                        
                        return original;
                    };
                }
            );

            logger.log("VoicePanelCard patched!");
        } catch (error) {
            logger.error("Patch error:", error);
        }
    },

    onUnload: () => {
        logger.log("Plugin unloaded");
    },

    settings: Settings,
}