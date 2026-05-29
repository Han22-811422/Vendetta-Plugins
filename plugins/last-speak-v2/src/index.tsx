import { patcher } from '@revenge-mod/api'
import { findByName, findByPropsLazy } from '@revenge-mod/metro'

const PLUGIN_VERSION = "3.2"
let unpatches: UnpatchFunction[] = []

export default {
    onLoad: async () => {
        console.log(`[VoicePanel] Loading v${PLUGIN_VERSION}`)
        
        try {
            // Wait 10 seconds for Discord to fully load
            console.log("[VoicePanel] Waiting 10 seconds...")
            await new Promise(resolve => setTimeout(resolve, 10000))
            
            // Strategy 1: Find by name
            console.log("[VoicePanel] Searching for VoicePanelCard...")
            let VoicePanelCard = findByName("VoicePanelCard")
            
            if (!VoicePanelCard) {
                console.log("[VoicePanel] Trying findByPropsLazy with participant...")
                try {
                    VoicePanelCard = findByPropsLazy("participant")
                } catch (e) {
                    console.error("[VoicePanel] findByPropsLazy failed:", e)
                }
            }
            
            if (!VoicePanelCard) {
                console.error("[VoicePanel] Could not find VoicePanelCard")
                return
            }

            console.log("[VoicePanel] Found VoicePanelCard!", VoicePanelCard)

            // Patch the default export
            if (VoicePanelCard.default || typeof VoicePanelCard === 'function') {
                const target = VoicePanelCard.default || VoicePanelCard
                
                const unpatch = patcher.instead(
                    'default',
                    VoicePanelCard,
                    ([props], orig) => {
                        console.log("[VoicePanel] Rendering with props:", props)
                        
                        const result = orig.apply(this, [props])
                        
                        if (result?.props?.children) {
                            const customText = {
                                type: 'Text',
                                props: {
                                    children: '📱 In Voice Chat',
                                    size: 12,
                                    color: '#00b0f4',
                                    style: { marginBottom: 8 }
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
                console.log("[VoicePanel] Patched successfully!")
            } else {
                console.error("[VoicePanel] Component doesn't have default export")
            }
            
        } catch (error) {
            console.error("[VoicePanel] Plugin error:", error)
        }
    },

    onUnload: () => {
        console.log("[VoicePanel] Unloading...")
        unpatches.forEach(unpatch => {
            try {
                unpatch()
            } catch (e) {
                console.error("[VoicePanel] Unpatch error:", e)
            }
        })
        unpatches = []
        console.log("[VoicePanel] Unloaded")
    },
}