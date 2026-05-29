import { logger } from "@vendetta";
import { showToast } from "@vendetta/ui/toasts";
import { patchAsyncComponent } from "@vendetta/ui/components";
import { findByDisplayName, findByName } from "@vendetta/metro";
import Settings from "./Settings";

const PLUGIN_VERSION = "1.2";

export default {
    onLoad: async () => {
        showToast(`🔧 Voice Panel Plugin v${PLUGIN_VERSION}`, 0);
        logger.log(`Voice Panel Plugin v${PLUGIN_VERSION} loaded`);
        
        try {
            // Wait 10 seconds for Discord to fully load
            showToast("⏳ Waiting 10 seconds for Discord...", 1);
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            showToast("🔍 Searching for component...", 1);
            logger.log("Searching for voice panel components");
            
            // Try to find VoicePanelCard
            let targetComponent = findByDisplayName("VoicePanelCard") || findByName("VoicePanelCard");
            let componentName = "VoicePanelCard";
            
            // Fallback to ParticipantCard
            if (!targetComponent) {
                targetComponent = findByDisplayName("ParticipantCard") || findByName("ParticipantCard");
                componentName = "ParticipantCard";
            }
            
            // Fallback to TransitionGroup or other wrapper
            if (!targetComponent) {
                targetComponent = findByDisplayName("TransitionGroup") || findByName("TransitionGroup");
                componentName = "TransitionGroup";
            }
            
            if (!targetComponent) {
                showToast("❌ Could not find target component", 2);
                logger.error("Target component not found");
                return;
            }

            showToast(`✅ Found ${componentName}! Patching...`, 1);
            logger.log(`Found ${componentName}, applying patch`);

            // Patch the component with deep traversal
            await patchAsyncComponent(
                targetComponent,
                (Component) => {
                    return (props) => {
                        const original = Component(props);
                        
                        // Recursively patch children to add text
                        if (original?.props?.children) {
                            const enhancedChildren = enhanceChildren(original.props.children);
                            original.props.children = enhancedChildren;
                        }
                        
                        return original;
                    };
                }
            );

            showToast("✨ Patch applied successfully!", 1);
            logger.log("Patch applied successfully");
        } catch (error) {
            showToast("❌ Error: " + error?.toString(), 2);
            logger.error("Patch error:", error);
        }
    },

    onUnload: () => {
        showToast("👋 Plugin unloaded", 0);
        logger.log("Plugin unloaded");
    },

    settings: Settings,
}

// Helper function to enhance children with custom text
function enhanceChildren(children) {
    if (!children) return children;
    
    const customText = {
        type: "Text",
        props: {
            children: "📱 In Voice Chat",
            size: 12,
            color: "#00b0f4",
            style: { marginBottom: 8, fontWeight: "600" }
        }
    };
    
    if (Array.isArray(children)) {
        return [customText, ...children];
    } else {
        return [customText, children];
    }
}