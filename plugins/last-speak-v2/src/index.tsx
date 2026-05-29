import { logger } from "@vendetta";
import { showToast } from "@vendetta/ui/toasts";
import { patchAsyncComponent } from "@vendetta/ui/components";
import { findByDisplayName } from "@vendetta/metro";
import Settings from "./Settings";

export default {
    onLoad: async () => {
        showToast("Voice Panel plugin loading", 0);
        
        try {
            // Wait 10 seconds for Discord to fully load
            showToast("Waiting 10 seconds for Discord to load...", 1);
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Find VoicePanelCard component
            const VoicePanelCard = findByDisplayName("VoicePanelCard");
            
            if (!VoicePanelCard) {
                showToast("Could not find VoicePanelCard", 2);
                return;
            }

            showToast("Found VoicePanelCard, patching...", 0);

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

            showToast("VoicePanelCard patched!", 1);
        } catch (error) {
            showToast("Patch error: " + error, 2);
        }
    },

    onUnload: () => {
        showToast("Plugin unloaded", 0);
    },

    settings: Settings,
}