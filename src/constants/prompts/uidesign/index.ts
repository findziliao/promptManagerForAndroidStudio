import { ui_component_design } from './ui-component-design';
import { ui_color_scheme } from './ui-color-scheme';
import { ui_layout_design } from './ui-layout-design';
import { ui_mobile_design } from './ui-mobile-design';
import { ui_responsive_design } from './ui-responsive-design';
import { personalCardPrompt } from './personal-card';
import { businessCardPrompt } from './business-card';
export const uidesignPrompts = [
  ui_component_design,
  ui_color_scheme,
  ui_layout_design,
  ui_mobile_design,
  ui_responsive_design,
  personalCardPrompt,
  businessCardPrompt
] as const; 