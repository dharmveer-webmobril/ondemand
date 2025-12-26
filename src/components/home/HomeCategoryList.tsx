import { View, FlatList, Pressable, StyleSheet } from 'react-native'
import { memo, useMemo } from 'react'
import { CustomText, Spacing } from '@components/common';
import imagePaths from '@assets';
import ImageLoader from '@components/common/ImageLoader';
import { ThemeType, useThemeContext } from '@utils/theme';
export const categoryData = [
    { image: imagePaths.plumb_img, name: 'Plumbing', id: 1 },
    { image: imagePaths.carpentry, name: 'Carpentry', id: 2 },
    { image: imagePaths.painting, name: 'Painting', id: 3 },
    { image: imagePaths.electrical, name: 'Electrical', id: 4 },
    { image: imagePaths.electrical, name: 'Electrical', id: 5 },
    { image: imagePaths.cleaning, name: 'Cleaning', id: 6 },
    { image: imagePaths.cleaning, name: 'Cleaning', id: 7 },
    { image: imagePaths.carpentry, name: 'Carpentry', id: 8 },
    { image: imagePaths.painting, name: 'Painting', id: 11 },
    { image: imagePaths.electrical, name: 'Electrical', id: 9 },
    { image: imagePaths.electrical, name: 'Electrical', id: 10 },
];

const SeparatorComponent = () => <Spacing horizontal space={15} />;
const HomeCategoryItem = memo(({ name, image, catId, subCat }: any) => {
    const theme = useThemeContext();
    const styles = useMemo(() => createStyles(theme), []);
    return (
        <Pressable
            onPress={() => { }}
            style={({ pressed }) => [
                styles.container,
                pressed && { opacity: 0.8 },
            ]}
        >
            <View style={styles.imageLoader}>
                <ImageLoader
                    source={image}
                    resizeMode="cover"
                    mainImageStyle={styles.mainImage}
                />
            </View>
            <CustomText style={styles.text} numberOfLines={2}>
                {name ? name.trim().charAt(0).toUpperCase() + name.trim().slice(1) : ''}
            </CustomText>
        </Pressable>
    );
});

export default function HomeCategoryList() {
    return (
        <View style={{ paddingHorizontal: 20, alignSelf: 'center', flex: 1 }}>
            <FlatList
                horizontal
                data={categoryData}
                keyExtractor={(item, index) => index + 'cat-home'}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    return <HomeCategoryItem
                        key={`homecategory-${item?.id ?? index}`}
                        id={item.id}
                        name={item.name}
                        image={item.image}
                    />
                }}
                ItemSeparatorComponent={SeparatorComponent}
            />
        </View>
    )
}

const createStyles = (theme: ThemeType) => {
    const { colors: Colors, SF, fonts: Fonts, SW } = theme;
    return StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        imageLoader: {
            height: SF(58),
            width: SF(58),
            borderRadius: SF(58) / 2,
            borderWidth: 1,
            borderColor: Colors.primary,
            overflow: 'hidden',
        },
        mainImage: {
            width: '100%',
            height: '100%',
        },
        text: {
            color: Colors.text,
            fontFamily: Fonts.MEDIUM,
            fontSize: SF(12),
            marginTop: 5,
            maxWidth: SW(80),
            textAlign: 'center',
        },
    })
}