/**
 * Framer Motion feature bundle, code-split out of first load (LazyMotion). domMax = animations,
 * gestures, exit AND layout (ValueProps / ShopGrid need layout). Loaded right after hydration; SSR renders
 * each m.* element in its `initial` state and it animates as soon as the features resolve.
 */
import { domMax } from "framer-motion";
export default domMax;
