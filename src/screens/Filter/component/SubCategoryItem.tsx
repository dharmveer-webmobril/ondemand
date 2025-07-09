import { View, Text, StyleSheet } from 'react-native';
import React, { FC } from 'react';
import { Checkbox, Spacing } from '../../../component';
import { Colors, SF, SH, SW } from '../../../utils';



// Interface for props
interface SubCategoryItemProps {
    subcat: {
        id: string;
        name: string;
        count: number;
        selected: boolean;
    };
    categoryId: number;
    selectedSubcat: string[];
    onChangeSubcatCheck: (subcatId: string, categoryId: number) => void;
}

const SubCategoryItem: FC<SubCategoryItemProps> = ({
    subcat,
    categoryId,
    selectedSubcat,
    onChangeSubcatCheck,
}) => {
    return (
        <View style={styles.container}>
            <Checkbox
                checked={selectedSubcat.includes(`${categoryId}-${subcat.id}`)}
                size={SW(14)}
                color={Colors.themeColor}
                onChange={() => onChangeSubcatCheck(subcat.id, categoryId)}
                label={subcat.name}
                checkBoxTextStyle={styles.subcat}

            />
            <Spacing horizontal space={SW(8)} />
        </View>
    );
};

export default SubCategoryItem;
const styles = StyleSheet.create({
    container: { backgroundColor: '#EEF6F9', marginLeft: SW(40), flexDirection: 'row', alignItems: 'center', paddingVertical: SH(4) },
    subcat: { flex: 1, fontSize: SF(12), color: '#407C95', fontFamily: 'MEDIUM' }
})