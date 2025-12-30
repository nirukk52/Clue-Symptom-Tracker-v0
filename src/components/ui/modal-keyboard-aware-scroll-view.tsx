/**
 * Keyboard-aware scroll view for bottom sheets
 * 
 * Why it exists: Provides keyboard handling inside @gorhom/bottom-sheet.
 * Falls back to regular ScrollView in Expo Go.
 */
import {
  type BottomSheetScrollViewMethods,
  createBottomSheetScrollableComponent,
  SCROLLABLE_TYPE,
} from '@gorhom/bottom-sheet';
import { type BottomSheetScrollViewProps } from '@gorhom/bottom-sheet/src/components/bottomSheetScrollable/types';
import Constants from 'expo-constants';
import { memo } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import Reanimated from 'react-native-reanimated';

const isExpoGo = Constants.appOwnership === 'expo';

// Use real KeyboardAwareScrollView only in dev builds
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AnimatedScrollView: any;

if (isExpoGo) {
  AnimatedScrollView = Reanimated.createAnimatedComponent(ScrollView);
} else {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeyboardAwareScrollView } = require('react-native-keyboard-controller');
    AnimatedScrollView = Reanimated.createAnimatedComponent(KeyboardAwareScrollView);
  } catch {
    AnimatedScrollView = Reanimated.createAnimatedComponent(ScrollView);
  }
}

const BottomSheetScrollViewComponent = createBottomSheetScrollableComponent<
  BottomSheetScrollViewMethods,
  BottomSheetScrollViewProps
>(SCROLLABLE_TYPE.SCROLLVIEW, AnimatedScrollView);
const BottomSheetKeyboardAwareScrollView = memo(BottomSheetScrollViewComponent);

BottomSheetKeyboardAwareScrollView.displayName =
  'BottomSheetKeyboardAwareScrollView';

export default BottomSheetKeyboardAwareScrollView as (
  props: BottomSheetScrollViewProps & ScrollViewProps
) => ReturnType<typeof BottomSheetKeyboardAwareScrollView>;
