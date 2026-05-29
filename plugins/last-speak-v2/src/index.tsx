import { patcher } from "@vendetta"
import { findByName, findByProps } from "@vendetta/metro"
import { showToast } from "@vendetta/ui/toasts"

const PLUGIN_VERSION = "3.1"
const unpatches = []

export default {
    onLoad: async () => {
        showToast(`🔧 Voice Panel Plugin v${PLUGIN_VERSION}`, 0)
        console.log(`[VoicePanel] Loading v${PLUGIN_VERSION}`)
        
        try {
            // Wait 10 seconds for Discord to fully load
            showToast("⏳ Waiting 10 seconds...", 1)
            await new Promise(resolve => setTimeout(resolve, 10000))
            
            // Strategy 1: Try findByName
            showToast("🔍 Searching for VoicePanelCard...", 1)
            let component = findByName("VoicePanelCard")
            let strategyUsed = "findByName"
            
            if (!component) {
                showToast("🔍 Trying findByProps...", 1)
                try {
                    component = findByProps("participant")
                    strategyUsed = "findByProps"
                } catch (e) {
                    console.log("[VoicePanel] findByProps failed:", e)
                }
            }
            
            if (!component) {
                showToast("❌ Could not find VoicePanelCard", 2)
                console.log("[VoicePanel] All strategies failed")
                return
            }

            showToast(`✅ Found using ${strategyUsed}!`, 1)
            console.log(`[VoicePanel] Found component using ${strategyUsed}:`, component)

            // Patch the component
            await patchComponent(component)
            
        } catch (error) {
            showToast("❌ Error: " + error?.toString(), 2)
            console.error("[VoicePanel] Plugin error:", error)
        }
    },

    onUnload: () => {
        unpatches.forEach(unpatch => {
            try {
                unpatch()
            } catch (e) {
                console.error("[VoicePanel] Unpatch error:", e)
            }
        })
        unpatches.length = 0
        showToast("👋 Plugin unloaded", 0)
    },
}

async function patchComponent(component) {
    try {
        console.log("[VoicePanel] Patching component...")
        
        // Patch using patcher.instead from @vendetta
        const unpatch = patcher.instead(
            "default",
            component,
            (args, originalFunc) => {
                try {
                    const result = originalFunc.apply(this, args)
                    
                    if (result?.props?.children) {
                        const customText = {
                            type: "Text",
                            props: {
                                children: "📱 In Voice Call",
                                size: 12,
                                color: "#00b0f4",
                                style: { marginBottom: 8, fontWeight: "600" }
                            }
                        }
                        
                        const children = Array.isArray(result.props.children)
                            ? result.props.children
                            : [result.props.children]
                        
                        result.props.children = [customText, ...children]
                    }
                    
                    return result
                } catch (e) {
                    console.error("[VoicePanel] Error in patch:", e)
                    return originalFunc.apply(this, args)
                }
            }
        )
        
        unpatches.push(unpatch)
        showToast("✨ VoicePanelCard patched successfully!", 1)
        console.log("[VoicePanel] Patch applied successfully")
        
    } catch (error) {
        console.error("[VoicePanel] Patch error:", error)
        showToast("❌ Patch failed: " + error?.toString(), 2)
    }
}