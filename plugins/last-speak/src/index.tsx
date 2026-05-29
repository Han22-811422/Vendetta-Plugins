import { logger } from "@vendetta";
import { React } from "@revenge-mod/modules/common";
import { after } from "@revenge-mod/patcher";
import { findByProps } from "@revenge-mod/modules/metro";

// Discord Text component
const Text = findByProps("Sizes", "Weights");

let unpatch: (() => void) | null = null;

// Placeholder text component
function PlaceholderText() {
    return (
        <Text
            size={Text.Sizes.SIZE_12}
            weight={Text.Weights.SEMIBOLD}
            color="text-muted"
            style={{ marginBottom: 4 }}
        >
            PLACEHOLDER
        </Text>
    );
}

export default {
    onLoad() {
        logger.log("Username placeholder loaded");

        unpatch = after("default", Text, (_, res) => {
            if (!res?.props) return res;

            const { children, color } = res.props;

            // Heuristic: this matches usernames in profile / voice panels
            if (
                typeof children === "string" &&
                color === "header-primary"
            ) {
                return (
                    <>
                        <PlaceholderText />
                        {res}
                    </>
                );
            }

            return res;
        });
    },

    onUnload() {
        logger.log("Username placeholder unloaded");

        unpatch?.();
        unpatch = null;
    },
};