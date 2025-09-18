/**
 * Worksheet DSL TypeScript definitions
 * Defines the structure for worksheet generation JSON
 */

export type ThemeType = 'orange-white-black' | 'blue-white-gray' | 'green-white-black' | 'purple-white-gray';
export type LayoutType = 'grid' | 'list' | 'columns' | 'free';
export type BoxSize = 'small' | 'medium' | 'large';
export type Spacing = 'tight' | 'normal' | 'spacious';
export type AssetType = 'icon' | 'image' | 'shape' | 'number' | 'text';
export type AssetArrangement = 'row' | 'grid' | 'scattered' | 'pattern';

export interface WorksheetMeta {
  id?: string;
  seed?: number;
  grade: string;
  subject: string;
  title: string;
}

export interface WorksheetLayout {
  type: LayoutType;
  rows?: number;
  cols?: number;
  show_answer_boxes: boolean;
  box_size?: BoxSize;
  spacing?: Spacing;
}

export interface WorksheetAsset {
  type: AssetType;
  name: string;
  count?: number;
  color?: string;
  size?: BoxSize;
  arrangement?: AssetArrangement;
}

export interface WorksheetItem {
  prompt: string;
  target_answer: string | number | string[];
  assets?: WorksheetAsset[];
}

export interface WorksheetBranding {
  logo: string;
  theme: ThemeType;
  footer?: string;
}

export interface WorksheetDSL {
  meta: WorksheetMeta;
  instructions: string;
  layout: WorksheetLayout;
  items: WorksheetItem[];
  answer_key: boolean;
  branding: WorksheetBranding;
}
