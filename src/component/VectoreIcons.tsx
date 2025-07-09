import React from 'react';
import IconF from 'react-native-vector-icons/Feather';
import IconA from 'react-native-vector-icons/AntDesign';
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';
import IconL from 'react-native-vector-icons/MaterialIcons';
import IconT from 'react-native-vector-icons/FontAwesome';
import IconE from 'react-native-vector-icons/EvilIcons';
import IconJ from 'react-native-vector-icons/Entypo';
import IconG from 'react-native-vector-icons/Ionicons';
import IconP from 'react-native-vector-icons/Octicons';
import IconW from 'react-native-vector-icons/FontAwesome5';
import IconV from 'react-native-vector-icons/Fontisto';
import IconX from 'react-native-vector-icons/FontAwesome6';

type IconType =
  | 'Feather'
  | 'AntDesign'
  | 'Fontisto'
  | 'MaterialCommunityIcons'
  | 'FontAwesome'
  | 'EvilIcons'
  | 'Entypo'
  | 'Ionicons'
  | 'Octicons'
  | 'FontAwesome5'
  | 'MaterialIcons'
  | "FontAwesome6";

interface VectorIconProps {
  icon: IconType;
  name: string;
  color?: string;
  size?: number;
  style?: object;
}

const VectorIcon: React.FC<VectorIconProps> = ({
  icon,
  name,
  color = 'black',
  size = 24,
  style = {},
}) => {
  const renderIcon = (): React.ReactNode => {
    switch (icon) {
      case 'Feather':
        return <IconF name={name} color={color} style={style} size={size} />;
      case 'AntDesign':
        return <IconA name={name} color={color} style={style} size={size} />;
      case 'Fontisto':
        return <IconV name={name} color={color} style={style} size={size} />;
      case 'MaterialCommunityIcons':
        return <IconM name={name} color={color} size={size} />;
      case 'FontAwesome':
        return <IconT name={name} color={color} style={style} size={size} />;
      case 'EvilIcons':
        return <IconE name={name} color={color} style={style} size={size} />;
      case 'Entypo':
        return <IconJ name={name} color={color} style={style} size={size} />;
      case 'Ionicons':
        return <IconG name={name} color={color} style={style} size={size} />;
      case 'Octicons':
        return <IconP name={name} color={color} style={style} size={size} />;
      case 'FontAwesome5':
        return <IconW name={name} color={color} style={style} size={size} />;
      case 'MaterialIcons':
        return <IconL name={name} color={color} style={style} size={size} />;
      case 'FontAwesome6':
        return <IconX name={name} color={color} style={style} size={size} />;

      default:
        return null;
    }
  };

  return <>{renderIcon()}</>;
};

export default VectorIcon;
