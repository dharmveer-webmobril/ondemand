import React, { useState, useRef, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, LayoutChangeEvent } from 'react-native';
import AppText from './AppText';

interface AccordionProps {
  title: string;
  children: ReactNode;
}

const AccordionComp: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isContentMeasured, setIsContentMeasured] = useState<boolean>(false); // To track if height is captured
  const animationValue = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    Animated.timing(animationValue, {
      toValue,
      duration: 300,
      useNativeDriver: false, // Cannot use native driver because height is being animated
    }).start();
  };

  const animatedHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight], // Dynamically adjust the max height
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    if (!contentHeight) {
      setContentHeight(event.nativeEvent.layout.height);
      setIsContentMeasured(true); // Set flag once height is captured
    }
  };

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity onPress={toggleAccordion} style={styles.header}>
        <AppText style={styles.headerText}>{title}</AppText>
      </TouchableOpacity>

      <Animated.View style={[styles.content, { height: animatedHeight }]}>
        {/* Dynamically calculate the content's height */}
        <View
          style={[
            styles.contentInner,
            !isContentMeasured && { position: 'absolute', opacity: 0 }, // Invisible until height is measured
          ]}
          onLayout={handleLayout}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  accordionContainer: {
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  header: {
    backgroundColor: '#3498db',
    padding: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    overflow: 'hidden',
  },
  contentInner: {
    padding: 15,
    backgroundColor: '#ecf0f1',
  },
});

export default AccordionComp