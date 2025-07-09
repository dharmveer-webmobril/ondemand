import { Text, Pressable, FlatList, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Colors, Fonts, SF, SH, SW } from '../../../utils';
import { AppText } from '../../../component';

interface HeaderProps {
    data: any;
}

const SubCatList: React.FC<HeaderProps> = ({ data }) => {
    const [selectedSubCat, setSelectedSubCat] = useState(['All']);

    return (
        <FlatList
            data={data}
            horizontal
            contentContainerStyle={styles.listContainer}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString() + item.text}
            renderItem={({ item }) => (
                <Pressable
                    onPress={() => setSelectedSubCat([item.text])}
                    style={[
                        styles.button,
                        { backgroundColor: selectedSubCat.includes(item.text) ? Colors.themeColor : Colors.white }
                    ]}
                >
                    <AppText
                        style={[
                            styles.text,
                            { color: selectedSubCat.includes(item.text) ? Colors.white : Colors.themeColor }
                        ]}
                    >
                        {item.text}
                    </AppText>
                </Pressable>
            )}
        />
    );
};

const styles = StyleSheet.create({
    listContainer: {
        marginTop: 10,
    },
    button: {
        paddingVertical: SH(5),
        paddingHorizontal: SW(10),
        borderRadius: SF(7),
    },
    text: {
        textDecorationLine: 'underline',
        fontFamily: Fonts.SEMI_BOLD,
        fontSize: SF(12),
    },
});

export default SubCatList;
