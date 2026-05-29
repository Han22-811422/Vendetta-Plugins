import { logger } from "@vendetta";
import { patchAsync } from "@vendetta/patcher";
import { findByPropsLazy } from "@revenge-mod/metro";
import Settings from "./Settings";

export default {
    onLoad: async () => {
        logger.log("Plugin loaded!");
        
        try {
            await new Promise(x => setTimeout(x, 10000));

            // Find the VoicePanelCard component
            const VoicePanelCard = findByPropsLazy("VoicePanelCard", false);
            
            if (!VoicePanelCard) {
                logger.error("Could not find VoicePanelCard");
                return;
            }
            
            // Patch the component
            patchAsync(
                VoicePanelCard,
                "default",
                (args) => (originalComponent) => {
                    const Component = (props) => {
                        const original = originalComponent(props);
                        
                        // Modify the component's children to add text above username
                        if (original?.props?.children) {
                            const children = Array.isArray(original.props.children) 
                                ? original.props.children 
                                : [original.props.children];
                            
                            // Insert your text before the existing children
                            original.props.children = [
                                {
                                    type: "Text",
                                    props: {
                                        children: "Your Custom Text",
                                        style: {
                                            fontSize: 12,
                                            color: "#ffffff",
                                            marginBottom: 4
                                        }
                                    }
                                },
                                ...children
                            ];
                        }
                        
                        return original;
                    };
                    return Component;
                }
            );
            
            logger.log("VoicePanelCard patched successfully!");
        } catch (error) {
            logger.error("Patch error:", error);
        }
    },
    
    onUnload: () => {
        logger.log("Plugin unloaded");
    },
    
    settings: Settings,
}