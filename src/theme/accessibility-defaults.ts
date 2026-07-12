import { Text, TouchableOpacity } from 'react-native';

type DefaultableComponent = { defaultProps?: Record<string, unknown> };

const textComponent = Text as unknown as DefaultableComponent;
textComponent.defaultProps = {
  ...textComponent.defaultProps,
  allowFontScaling: true,
  maxFontSizeMultiplier: 1.6,
};

const touchableComponent = TouchableOpacity as unknown as DefaultableComponent;
touchableComponent.defaultProps = {
  ...touchableComponent.defaultProps,
  accessibilityRole: 'button',
};
