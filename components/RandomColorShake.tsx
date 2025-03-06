import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Colors } from '@/constants/Colors';

const SHAKE_THRESHOLD = 1.5;
const tapOrShake = 'Tap or Shake'

export const RandomColorShake = () => {
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [currentColor, setCurrentColor] = useState(Colors.white);
  const [nextColor, setNextColor] = useState(Colors.white);
  const [currentFont, setCurrentFont] = useState('Inter_900Black');
  const [nextFont, setNextFont] = useState('Mynerve_400Regular');
  const [fonts, setFonts] = useState([
    'Mynerve_400Regular',
    'Inter_900Black',
    'Roboto_700Bold',
    'RubikStorm_400Regular',
    'OpenSans_400Regular',
    'RubikBurned_400Regular',
    'Montserrat_500Medium',
    'Lato_400Regular',
  ]);
  const colorAnimation = useRef(new Animated.Value(0)).current;
  const fontAnimation = useRef(new Animated.Value(0)).current;

  const changeFont = useCallback(() => {
    const newFont = fonts[0];
    setNextFont(newFont);

    fontAnimation.setValue(0);
    Animated.timing(fontAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setCurrentFont(newFont);
      setFonts(([first, ...rest]) => [...rest, first]);
    });
  }, [fonts, fontAnimation]);

  const generateRandomColor = () => {
    changeFont();
    const newColor = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`;
    setNextColor(newColor);

    colorAnimation.setValue(0);
    Animated.timing(colorAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      setCurrentColor(newColor);
    });
  };

  const handleShake = ({ x, y, z }: { x: number, y: number, z: number }) => {
    const acceleration = Math.sqrt(x * x + y * y + z * z);

    if (acceleration > SHAKE_THRESHOLD) {
      const currentTime = new Date().getTime();

      if (currentTime - lastShakeTime > 1000) {
        setLastShakeTime(currentTime);
        generateRandomColor();
      }
    }
  };

  const backgroundColor = colorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [currentColor, nextColor],
  });

  const currentFontOpacity = fontAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const nextFontOpacity = fontAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(handleShake);

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={generateRandomColor}>
      <Animated.View style={[styles.container, { backgroundColor }]}>
        <Animated.Text
          style={[
            styles.text,
            { fontFamily: currentFont, opacity: currentFontOpacity },
          ]}
        >
          {tapOrShake}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.text,
            { fontFamily: nextFont, opacity: nextFontOpacity, position: 'absolute' },
          ]}
        >
          {tapOrShake}
        </Animated.Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});