import React from 'react';
import {View, Text, Image, FlatList, StyleSheet} from 'react-native';
import {Colors, SH, SW, Fonts, SF, boxShadowlight} from '../utils';
import imagePaths from '../assets/images';
import {AppHeader, AppText, Container, HomeSearchBar} from '../component';
import {useNavigation, useRoute} from '@react-navigation/native';

// Define Enum for List Types
enum ListType {
  CATEGORY = 'category',
  NEAR_BY = 'near_by',
  RECOMMENDED = 'recommended',
}

// Define Item Props for Each List Type
interface CategoryItem {
  id: number | string;
  name: string;
  image: any; // Change type based on actual assets
}

interface NearByItem extends CategoryItem {
  rating: number;
  ratingCount: number;
  location: string;
  price: number;
}

interface RecommendedItem extends CategoryItem {
  rating: number;
}

// Union Type for Different Item Types
type ItemProps = CategoryItem | NearByItem | RecommendedItem;

// Dummy Data for Lists
const categoryData: CategoryItem[] = [
  {image: imagePaths.plumb_img, name: 'Plumbing', id: 1},
  {image: imagePaths.carpentry, name: 'Carpentry', id: 2},
  {image: imagePaths.cleaning, name: 'Cleaning', id: 3},
];

const nearByData: NearByItem[] = [
  {
    image: imagePaths.electrical,
    name: 'Electrical',
    id: 3,
    rating: 4.5,
    ratingCount: 450,
    location: 'Ikeja, Nigeria',
    price: 80,
  },
  {
    image: imagePaths.plumb_img,
    name: 'Plumbing',
    id: 3,
    rating: 4.5,
    ratingCount: 450,
    location: 'Ikeja, Nigeria',
    price: 80,
  },
];

const recommendedData: RecommendedItem[] = [
  {image: imagePaths.recomanded1, name: 'Painting', id: 4, rating: 4.8},
  {image: imagePaths.recomanded2, name: 'Painting', id: 4, rating: 4.8},
  {image: imagePaths.recomanded3, name: 'Painting', id: 4, rating: 4.8},
];

const TwoColumnList: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {title, type} = route.params;

 
  const getData = (): ItemProps[] => {
    switch (type) {
      case ListType.CATEGORY:
        return categoryData;
      case ListType.NEAR_BY:
        return nearByData;
      case ListType.RECOMMENDED:
        return recommendedData;
      default:
        return [];
    }
  };
   

  const renderItem = ({item}: {item: ItemProps}) => {
    if (type === ListType.NEAR_BY) {
      const nearItem = item as NearByItem;
      return (
        <View style={[styles.itemNearByContainer,boxShadowlight]}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
          <View style={{paddingHorizontal: SW(10)}}>
            <View style={styles.ratingContainer}>
              <Image
                source={imagePaths.star_filled}
                tintColor={Colors.ratingColor}
                resizeMode="contain"
                style={styles.nearverifiedIcon}
              />
              <AppText style={styles.nearratingtext}>{'4.5'}</AppText>
              <AppText style={styles.nearratingtextcount}>(450)</AppText>
            </View>
            <AppText style={styles.nearSearvicename}>{item.name}</AppText>
            <AppText style={styles.nearbyadd}>Ikeja, Nigeria</AppText>
            <AppText style={styles.servicePrice}>
              $80{' '}
              <AppText style={[styles.nearbyadd, {fontSize: SH(12)}]}>
                Per hr.
              </AppText>
            </AppText>
          </View>
        </View>
      );
    } else if (type === ListType.RECOMMENDED) {
      const recommendedItem = item as RecommendedItem;
      return (
        <View style={styles.itemNearByContainer}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
          <View style={{paddingHorizontal: SW(10)}}>
            <AppText style={styles.text}>{item.name}</AppText>
            <View style={styles.ratingContainer}>
              <Image
                source={imagePaths.star_filled}
                resizeMode="contain"
                style={styles.verifiedIcon}
              />
              <AppText style={styles.ratingtext}>{'4.5'}</AppText>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={[styles.itemContainer,boxShadowlight]}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
          <AppText style={styles.text}>{item.name}</AppText>
        </View>
      );
    }
  };

  return (
    <Container statusBarColor={Colors.white}>
      <AppHeader
        headerTitle={title}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}
        Iconname="arrowleft"
        rightOnPress={() => {}}
        headerStyle={{backgroundColor:Colors.bgwhite}}
        titleStyle={{color: Colors.textHeader, fontSize: SF(18)}}
      />
      <View
        style={{
          alignSelf: 'center',
          marginHorizontal: SW(20),
          marginTop: SH(5),
        }}>
        <HomeSearchBar showFilterIcon={false} />
      </View>
      <FlatList
        data={getData()}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString() + title}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        removeClippedSubviews={false}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: SH(20),
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: '48%', // Adjust to fit within two columns
    alignItems: 'center',
    marginBottom: SH(20),
    backgroundColor: Colors.themelight,
    borderRadius: SW(10),
    paddingBottom: SH(10),
 
  },
  itemNearByContainer: {
    width: '48%',
    marginBottom: SH(20),
    backgroundColor: Colors.themelight,
    borderRadius: SW(10),
    paddingBottom: SH(10),
    shadowColor: '#000',
  },
  image: {
    width: '100%',
    height: SW(120),
    borderRadius: SW(10),
  },
  text: {
    marginTop: SH(10),
    fontSize: SH(14),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  nearSearvicename: {
    marginTop: SH(7),
    fontSize: SH(14),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
  },
  servicePrice: {
    marginTop: SH(7),
    fontSize: SH(16),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
  },
  nearbyadd: {
    marginTop: SH(2),
    fontSize: SH(10),
    fontFamily: Fonts.REGULAR,
    color: Colors.addressColor,
  },
  nearratingtext: {
    color: Colors.ratingColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SH(12),
    marginLeft: 5,
  },
  nearratingtextcount: {
    color: Colors.searchBarPlac,
    fontFamily: Fonts.MEDIUM,
    fontSize: SH(12),
    marginLeft: 5,
  },
  nearverifiedIcon: {
    width: SW(14),
    height: SW(14),
    tintColor: Colors.ratingColor,
    marginTop: -2,
  },
  verifiedIcon: {
    width: SW(14),
    height: SW(14),
    marginTop: -2,
  },
  ratingtext: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SH(12),
    marginLeft: 5,
  },
});

export default TwoColumnList;
