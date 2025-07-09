import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import React, { memo, useMemo } from 'react';
import { Colors, Fonts, SF, SH, SW } from '../../utils';
import ImageLoader from '../ImageLoader';
import { Source } from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import Spacing from '../Spacing';
import AppText from '../AppText';

interface HomeCategoryItemProps {
  name: string,
  image: Source,
  id: string | number
}
interface HomeCategoryProps {
  categoryData: HomeCategoryItemProps[],
  isLoading: boolean,
}
const SeparatorComponent = () => <Spacing horizontal space={SF(12)} />;
const HomeCategoryItem: React.FC<HomeCategoryItemProps> = memo(({ name, image }) => {
  const navigation = useNavigation<any>();
  return (
    <Pressable
      onPress={() => navigation.navigate(RouteName.SHOP_LIST)}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View>
        <ImageLoader
          source={image}
          resizeMode="cover"
          mainImageStyle={styles.imageLoader}
        />
      </View>
      <AppText style={styles.text} numberOfLines={2}>{name}</AppText>
    </Pressable>
  );
});

const HomeCategory: React.FC<HomeCategoryProps> = memo(({ categoryData }) => {
  const memoizedCategoryData = useMemo(() => categoryData, [categoryData]);
  return (
    <>
      <FlatList
        horizontal
        data={memoizedCategoryData}
        ItemSeparatorComponent={SeparatorComponent}
        keyExtractor={(item, index) => item.name + 'cat' + index}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <HomeCategoryItem {...item} />}
        contentContainerStyle={styles.flatListContainer}
      />
    </>
  );
});

export default HomeCategory;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageLoader: {
    height: SF(56),
    width: SF(56),
    borderRadius: SF(56) / 2,
    borderWidth: 1,
    borderColor: Colors.themeColor,
  },
  text: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
    marginTop: 5,
    maxWidth: SW(80),
  },
  flatListContainer: {
    paddingLeft: 6,
  },
});
