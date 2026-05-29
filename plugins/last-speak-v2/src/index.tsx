import { logger } from "@vendetta";
import { patchAsyncComponent } from "@vendetta/ui/components";
import { findByDisplayName, findByName } from "@vendetta/metro";
import Settings from "./Settings";

export default {
    onLoad: async () => {
        logger.log("VoicePanel plugin loading...");
        
        try {
            // Wait 10 seconds for Discord to fully load
            logger.log("Waiting 10 seconds for Discord to load...");
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Try to find the component by display name
            const VoicePanelCard = await findByDisplayName("VoicePanelCard");
            
            if (!VoicePanelCard) {
                logger.warn("Could not find VoicePanelCard by display name");
                return;
            }

            logger.log("Found VoicePanelCard, applying patch...");

            // Use patchAsyncComponent for React components
            const unpatch = await patchAsyncComponent(
                VoicePanelCard,
                (Component) => (props) => {
                    const original = Component(props);
                    
                    // Wrap the component to inject text above username
                    return {
                        ...original,
                        props: {
                            ...original.props,
                            // Add your text before existing children
                            children: [
                                {
                                    type: "Text",
                                    props: {
                                        children: "Status: In Call",
                                        variant: "text-sm/medium",
                                        color: "text-positive",
                                        style: { marginBottom: 4 }
                                    }
                                },
                                ...(Array.isArray(original.props.children) 
                                    ? original.props.children 
                                    : [original.props.children])
                            ]
                        }
                    };
                }
            );

            logger.log("VoicePanelCard patched successfully!");
        } catch (error) {
            logger.error("Error patching VoicePanelCard:", error?.toString());
        }
    },

    onUnload: () => {
        logger.log("VoicePanel plugin unloaded");
    },

    settings: Settings,
}