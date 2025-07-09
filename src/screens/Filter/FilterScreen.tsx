import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { FC, useState } from 'react';
import { AppText, Buttons, Checkbox, Container, Divider, Spacing, VectoreIcons } from '../../component';
import { Colors, Fonts, SF, SH, SW } from '../../utils';
import imagePaths from '../../assets/images';
import { StyleSheet } from 'react-native';
import CategoryItem from './component/CategoryItem';
import RatingItem from './component/RatingItem';
import PriceRangeSlider from './component/PriceRangeSlider';
import { useNavigation } from '@react-navigation/native';

// Sample data
const categoryData = [
  {
    title: 'Personal care',
    categoryId: 1,
    subCategories: [
      { id: '1', name: 'Barber shops', count: 25, selected: false },
      { id: '2', name: 'Hair salon', count: 30, selected: false },
      { id: '3', name: 'Skin/beauty Care', count: 45, selected: false },
      { id: '4', name: 'Massage', count: 25, selected: false },
      { id: '5', name: 'Spas', count: 10, selected: false },
      { id: '6', name: 'Tanning salon', count: 15, selected: false },
    ],
  },
  {
    title: 'Home Services',
    categoryId: 2,
    subCategories: [
      { id: '1', name: 'Barber shops', count: 25, selected: false },
      { id: '2', name: 'Hair salon', count: 30, selected: false },
      { id: '3', name: 'Skin/beauty Care', count: 45, selected: false },
      { id: '4', name: 'Massage', count: 25, selected: false },
      { id: '5', name: 'Spas', count: 10, selected: false },
      { id: '6', name: 'Tanning salon', count: 15, selected: false },
    ],
  },
  {
    title: 'Health & Fitness',
    categoryId: 3,
    subCategories: [
      { id: '1', name: 'Barber shops', count: 25, selected: false },
      { id: '2', name: 'Hair salon', count: 30, selected: false },
      { id: '3', name: 'Skin/beauty Care', count: 45, selected: false },
      { id: '4', name: 'Massage', count: 25, selected: false },
      { id: '5', name: 'Spas', count: 10, selected: false },
      { id: '6', name: 'Tanning salon', count: 15, selected: false },
    ],
  },
];

const ratingData = [1, 2, 3, 4, 5];

// Interface for props
interface FilterScreenProps { }

// Main FilterScreen Component
const FilterScreen: FC<FilterScreenProps> = () => {
  const [selectedCat, setSelectedCat] = useState<number[]>([]);
  const [openedCat, setOpenedCat] = useState<number[]>([]);
  const [selectedSubcat, setSelectedSubcat] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [advanceFilterOpen, setAdvanceFilterOpen] = useState<boolean>(false);

  const onChangeCatCheck = (categoryId: number) => {
    setSelectedCat((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const onToggleDropdown = (categoryId: number) => {
    setOpenedCat((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const onChangeSubcatCheck = (subcatId: string, categoryId: number) => {
    const subcatKey = `${categoryId}-${subcatId}`;
    setSelectedSubcat((prev) =>
      prev.includes(subcatKey)
        ? prev.filter((id) => id !== subcatKey)
        : [...prev, subcatKey]
    );
  };

  const onSelectRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };

  const onPriceChange = (low: number, high: number) => {
    setMinPrice(low);
    setMaxPrice(high);
  };
  const navigation = useNavigation<any>();
  return (
    <Container style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sccrol}>
        <View style={styles.headerContainer}>
          <AppText style={styles.headerTitle}>Filter for you</AppText>
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <VectoreIcons
              icon="AntDesign"
              name="close"
              size={SF(22)}
              color={Colors.themeColor}
            />
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <AppText style={styles.subtitle}>Categories</AppText>
        <View style={styles.categoryWrapper}>
          {categoryData.map((cat) => (
            <CategoryItem
              key={cat.categoryId}
              category={cat}
              selectedCat={selectedCat}
              openedCat={openedCat}
              selectedSubcat={selectedSubcat}
              onChangeCatCheck={onChangeCatCheck}
              onToggleDropdown={onToggleDropdown}
              onChangeSubcatCheck={onChangeSubcatCheck}
            />
          ))}
        </View>

        {/* Advanced Filter Section */}
        <Spacing space={SH(15)} />
        <View style={styles.advancedFilterHeader}>
          <AppText style={styles.subtitle}>Advanced Filter</AppText>
          <TouchableOpacity onPress={() => { setAdvanceFilterOpen(!advanceFilterOpen) }} style={styles.dropdownIcon}>
            <Image
              resizeMode='contain'
              source={!advanceFilterOpen ? imagePaths.down : imagePaths.down} style={[styles.icon, advanceFilterOpen && {
                transform: [
                  { rotate: '180deg' },
                ]
              }]} />
          </TouchableOpacity>
        </View>
        <Spacing space={SH(10)} />
        {
          advanceFilterOpen &&
          <View style={styles.advancedFilterWrapper}>
            {/* Rating Section */}
            <AppText style={styles.labal}>Rating</AppText>
            <Spacing />
            <View style={styles.ratingContainer}>
              {ratingData.map((rating) => (
                <RatingItem
                  key={rating}
                  rating={rating}
                  selectedRatings={selectedRatings}
                  onSelectRating={onSelectRating}
                />
              ))}
            </View>
            <Spacing space={SH(15)} />
            {/* <Divider style={styles.divider} /> */}
            <Spacing space={SH(15)} />
            {/* Distance Section */}
            <View style={styles.distanceHeaderContainer}>
              <AppText style={styles.labal}>Distance</AppText>
              <View style={styles.distanceValueContainer}>
                <VectoreIcons
                  icon="Entypo"
                  name="minus"
                  size={SF(16)}
                  color={Colors.themeColor}
                />
                <TouchableOpacity style={styles.distanceValueButton}>
                  <AppText style={styles.labal}>2 km</AppText>
                </TouchableOpacity>
                <VectoreIcons
                  icon="Entypo"
                  name="plus"
                  size={SF(16)}
                  color={Colors.themeColor}
                />
              </View>
            </View>

            {/* Price Range Section */}
            <Spacing space={SH(15)} />
            {/* <Divider style={styles.divider} /> */}
            <Spacing space={SH(15)} />
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={onPriceChange}
            />
          </View>
        }
        {/* Map Box */}
        <View style={styles.mapContainer}>
          <Image
            source={imagePaths.map_img}
            style={styles.mapImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.saveFilterContainer}>
          <Checkbox
            checked={true}
            size={SW(12)}
            color={Colors.themeColor}
            onChange={() => null}
            label=""
          />
          <AppText style={styles.saveFilterText}>Save filter for future</AppText>
        </View>
        <Buttons
          title="Apply Filter"
          buttonStyle={styles.applyFilterButton}
        />
      </ScrollView>
    </Container>
  );
};

// Styles
const styles = StyleSheet.create({
  sccrol: {
    flexGrow: 1, paddingBottom: SF(20)
  },
  container: {
    backgroundColor: 'white',
    paddingHorizontal: SW(20),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SF(20),
  },
  headerTitle: {
    color: Colors.textAppColor,
    fontSize: SF(20),
    fontFamily: Fonts.SEMI_BOLD,
  },
  categoryWrapper: {
    backgroundColor: '#EEF6F9',
    borderRadius: SW(10),
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: SW(20),
    paddingVertical: SH(6),
    alignItems: 'center',
  },
  subCategoryContainer: {
    backgroundColor: '#EEF6F9',
    marginLeft: SW(40),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SH(4),
  },
  advancedFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: SW(8),
  },
  advancedFilterWrapper: {
    backgroundColor: '#EEF6F9',
    borderRadius: SW(10),
    paddingHorizontal: SW(20),
    paddingVertical: SH(10),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ratingButton: {
    paddingVertical: SF(5),
    width: '18%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SF(10),
    borderColor: Colors.themeColor,
    borderWidth: 1,
    marginBottom: SH(5),
  },
  selectedRatingButton: {
    backgroundColor: Colors.themeColor,
  },
  selectedRatingText: {
    color: Colors.white,
  },
  priceSliderContainer: {
    marginTop: SH(10),
  },
  slider: {
    width: '100%',
    height: SH(50),
  },
  thumb: {
    width: SW(20),
    height: SW(20),
    borderRadius: SW(10),
    backgroundColor: Colors.themeColor,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  rail: {
    flex: 1,
    height: SH(4),
    borderRadius: SW(2),
    backgroundColor: Colors.white,
  },
  railSelected: {
    height: SH(4),
    backgroundColor: Colors.themeColor,
    borderRadius: SW(2),
  },
  labelContainer: {
    backgroundColor: Colors.themeColor,
    borderRadius: SW(5),
    paddingHorizontal: SW(8),
    paddingVertical: SH(4),
    marginBottom: SH(5),
  },
  labelText: {
    color: Colors.white,
    fontSize: SF(12),
    fontFamily: Fonts.MEDIUM,
  },
  notch: {
    width: SW(8),
    height: SH(8),
    borderLeftWidth: SW(4),
    borderRightWidth: SW(4),
    borderTopWidth: SH(4),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.themeColor,
  },
  priceHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceRangeText: {
    color: Colors.themeColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
  },
  distanceHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceValueButton: {
    width: SW(50),
    marginHorizontal: SW(10),
    paddingVertical: SF(5),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SF(10),
    borderColor: Colors.themeColor,
    borderWidth: 1,
  },
  divider: {
    height: 0.6,
    backgroundColor: Colors.themeColor,
  },
  mapContainer: {
    paddingHorizontal: SW(10),
    overflow: 'hidden',
    borderRadius: SF(8),
    marginTop: SH(20),
  },
  mapImage: {
    height: SH(140),
    alignSelf: 'center',
  },
  saveFilterContainer: {
    flexDirection: 'row',
    paddingLeft: SW(20),
    alignItems: 'center',
    marginTop: SH(10),
  },
  saveFilterText: {
    marginLeft: SW(10),
    color: Colors.themeColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
  },
  applyFilterButton: {
    marginTop: SH(50),
  },
  title: {
    flex: 1,
    fontSize: SF(12),
    color: '#407C95',
    fontFamily: Fonts.MEDIUM,
  },
  subtitle: {
    color: Colors.themeColor,
    fontFamily: Fonts.SEMI_BOLD,
    marginBottom: SH(8),
    fontSize: SF(14),
  },
  labal: {
    color: Colors.themeColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
  },
  dropdownIcon: {
    paddingHorizontal: SW(5),
  },
  icon: { height: SF(11), width: SF(11), tintColor: Colors.themeColor }
});

export default FilterScreen;