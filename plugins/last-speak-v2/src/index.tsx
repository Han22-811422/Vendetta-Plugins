import { patcher } from '@revenge-mod/api'
import { findByDisplayName } from '@revenge-mod/metro'
import { showToast } from "@vendetta/ui/toasts"

const PLUGIN_VERSION = "2.1"
const unpatches = []

export default {
    onLoad: async () => {
        showToast(`🔧 Voice Panel Plugin v${PLUGIN_VERSION}`, 0)
        
        try {
            // Wait 10 seconds for Discord to fully load
            showToast("⏳ Waiting 10 seconds for Discord...", 1)
            await new Promise(resolve => setTimeout(resolve, 10000))
            
            showToast("🔍 Searching for VoicePanelCard...", 1)
            
            // Find VoicePanelCard component
            const VoicePanelCard = findByDisplayName("VoicePanelCard")
            
            if (!VoicePanelCard) {
                showToast("❌ VoicePanelCard not found", 2)
                return
            }

            showToast("✅ Found VoicePanelCard! Patching...", 1)

            // Patch using patcher.instead() - intercepts and replaces function
            const unpatch = patcher.instead(
                'default',
                VoicePanelCard,
                (args, originalFunc) => {
                    // Call the original function
                    const result = originalFunc.apply(this, args)
                    
                    // Inject custom text above username
                    if (result?.props?.children) {
                        const customText = {
                            type: 'Text',
                            props: {
                                children: '📱 In Voice Chat',
                                size: 12,
                                color: '#00b0f4',
                                style: { 
                                    marginBottom: 8,
                                    fontWeight: '600'
                                }
                            }
                        }
                        
                        const children = Array.isArray(result.props.children)
                            ? result.props.children
                            : [result.props.children]
                        
                        result.props.children = [customText, ...children]
                    }
                    
                    return result
                }
            )
            
            unpatches.push(unpatch)
            showToast("✨ VoicePanelCard patched successfully!", 1)

        } catch (error) {
            showToast("❌ Error: " + error?.toString(), 2)
            console.error("Plugin error:", error)
        }
    },

    onUnload: () => {
        // Clean up all patches
        unpatches.forEach(unpatch => {
            try {
                unpatch()
            } catch (e) {
                console.error("Unpatch error:", e)
            }
        })
        
        unpatches.length = 0 // Clear array
        showToast("👋 Plugin unloaded", 0)
    },
}