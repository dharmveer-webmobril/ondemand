import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StatusBar,
  StatusBarStyle,
  TouchableOpacity,
  SafeAreaView as SafeAreaViewRN,
  Alert,
} from 'react-native';
import { Colors, SH, SW } from '../utils';
import VectorIcon from './VectoreIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

type ContainerProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  statusBarColor?: string;
  statusBarStyle?: StatusBarStyle;
  isAuth?: boolean;
  isBackButton?: boolean;
  onBackPress?: () => void; // Type-safe onBackPress function
  isPadding?: boolean
};

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  statusBarColor, // Default status bar color
  statusBarStyle = 'dark-content', // Default status bar style
  isBackButton = false,
  isAuth = false,
  onBackPress = () => { }, // Default function to prevent undefined behavior
}) => {
  let statusbarColor = statusBarColor || '#ffffff'

  if (!isAuth) {
    return (
      <SafeAreaView style={[styles.container, style]}>
        {children}
      </SafeAreaView>
    )
  }
  return (
    <View style={[styles.container, style]}>
      <StatusBar
        backgroundColor={statusbarColor}
        barStyle={statusBarStyle || 'light-content'}
      />
      <SafeAreaViewRN style={{height:0,backgroundColor:statusbarColor}}/> 
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Default container background
  },
  backIconContainer: {
    width: SH(40),
    height: SH(40),
    marginTop: SH(40),
    marginLeft: 20,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
});

export default Container;
