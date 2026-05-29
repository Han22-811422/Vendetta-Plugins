import { patcher } from '@revenge-mod/api'
import { findByName, findByProps, findByPropsLazy, findByType } from '@revenge-mod/metro'
import { showToast } from "@vendetta/ui/toasts"

const PLUGIN_VERSION = "3.0"
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
            showToast("🔍 Strategy 1: findByName...", 1)
            let component = findByName("VoicePanelCard", false)
            
            if (component) {
                showToast("✅ Found via findByName!", 1)
                await patchComponent(component)
                return
            }
            
            // Strategy 2: Try findByProps with 'participant' key
            showToast("🔍 Strategy 2: findByProps...", 1)
            try {
                const participantProps = findByProps("participant", false)
                if (participantProps) {
                    showToast("✅ Found via findByProps!", 1)
                    await patchComponent(participantProps)
                    return
                }
            } catch (e) {
                console.log("[VoicePanel] findByProps failed:", e)
            }
            
            // Strategy 3: Try finding Text component related to voice
            showToast("🔍 Strategy 3: Finding Text components...", 1)
            try {
                const textModules = findByType("Text", false)
                if (Array.isArray(textModules) && textModules.length > 0) {
                    // Patch the first match
                    await patchComponent(textModules[0])
                    return
                }
            } catch (e) {
                console.log("[VoicePanel] findByType failed:", e)
            }
            
            // Strategy 4: Patch through lazy loading
            showToast("🔍 Strategy 4: Using lazy find...", 1)
            try {
                const lazyComponent = findByPropsLazy("participant")
                if (lazyComponent) {
                    showToast("✅ Found via findByPropsLazy!", 1)
                    await patchComponent(lazyComponent)
                    return
                }
            } catch (e) {
                console.log("[VoicePanel] findByPropsLazy failed:", e)
            }
            
            showToast("❌ Could not find component with any strategy", 2)
            console.log("[VoicePanel] All strategies failed")
            
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
        console.log("[VoicePanel] Unloaded")
    },
}

async function patchComponent(component) {
    try {
        console.log("[VoicePanel] Attempting to patch component:", component)
        
        // Try patching the default export
        if (component?.default) {
            const unpatch = patcher.instead(
                'default',
                component,
                (args, originalFunc) => {
                    try {
                        const result = originalFunc.apply(this, args)
                        
                        if (result?.props?.children) {
                            const customText = {
                                type: 'Text',
                                props: {
                                    children: '📱 In Call',
                                    size: 12,
                                    color: '#00b0f4',
                                    style: { marginBottom: 8, fontWeight: '600' }
                                }
                            }
                            
                            const children = Array.isArray(result.props.children)
                                ? result.props.children
                                : [result.props.children]
                            
                            result.props.children = [customText, ...children]
                        }
                        
                        return result
                    } catch (e) {
                        console.error("[VoicePanel] Patch function error:", e)
                        return originalFunc.apply(this, args)
                    }
                }
            )
            
            unpatches.push(unpatch)
            showToast("✨ Component patched successfully!", 1)
            console.log("[VoicePanel] Patch applied")
            return true
        }
        
        // Try patching as direct function
        const unpatch = patcher.instead(
            'default',
            component,
            (args, originalFunc) => {
                const result = originalFunc.apply(this, args)
                if (result?.props?.children) {
                    result.props.children = [{
                        type: 'Text',
                        props: {
                            children: '📱 In Call',
                            size: 12,
                            color: '#00b0f4'
                        }
                    }, ...(Array.isArray(result.props.children) ? result.props.children : [result.props.children])]
                }
                return result
            }
        )
        
        unpatches.push(unpatch)
        showToast("✨ Patched!", 1)
        return true
        
    } catch (error) {
        console.error("[VoicePanel] Patch error:", error)
        return false
    }
}