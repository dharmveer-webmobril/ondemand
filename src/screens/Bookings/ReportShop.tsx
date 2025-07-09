import { View, Text, StyleSheet, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { AppHeader, AppText, Buttons, Container, DropdownComponent, InputField, Spacing } from '../../component'
import { Colors, Fonts, SF, SH } from '../../utils'
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const data = [
    { label: 'Report 1', value: '1' },
    { label: 'Report 2', value: '2' },
    { label: 'Report 3', value: '3' },
    { label: 'Report 4', value: '4' },
    { label: 'Report 5', value: '5' },
    { label: 'Report 6', value: '6' },
    { label: 'Report 7', value: '7' },
];
export default function ReportShop() {
    const navigation = useNavigation<any>();
    const [values, setValues] = useState({
        reson: "",
        des: ''
    })
    return (
        <Container style={styles.container}>
            <AppHeader
                headerTitle={'Report'}
                onPress={() => navigation.goBack()}
                Iconname="arrowleft"
                rightOnPress={() => { }}
                headerStyle={{ backgroundColor: '#ffffff',paddingHorizontal:SF(30) }}
                titleStyle={{ color: '#333', fontSize: SF(18) }}
            />
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: '7%' }}
                showsVerticalScrollIndicator={false}
                extraScrollHeight={SH(40)}>

                <View>
                    <Spacing space={SH(20)} />
                    <AppText style={{ fontFamily: Fonts.MEDIUM, fontSize: SF(14), marginBottom: SH(10) }}>Select report reason</AppText>
                    <DropdownComponent data={data} />
                    <Spacing/>
                    <InputField
                        placeholder={'Tell us more'}
                        value={values.des}
                        onChangeText={(txt) => { setValues((prev) => { return { ...prev, des: txt } }) }}
                        onBlur={() => { }}
                        keyboardType={'default'}
                        color={Colors.textAppColor}
                        textColor={Colors.textAppColor}
                        placeholderTextColor={'#7F7F7F'}
                        multiline
                        inputContainer={{ height: SH(90), alignItems: 'flex-start' }}
                        inputStyle={{ fontSize: SF(12) }}
                    />
                </View>


            </KeyboardAwareScrollView>
            <Buttons
                buttonStyle={styles.submitButton}
                textColor={Colors.textWhite}
                title={'Report'}
                onPress={() => {
                    Keyboard.dismiss();
                }}
            // isLoading={true}
            />
        </Container>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgwhite,
    },
    desc: {
        fontFamily: Fonts.REGULAR,
        color: Colors.textAppColor,
        lineHeight: SH(20), marginHorizontal: "5%",
        marginTop: 10
    },
    submitButton: {
        backgroundColor: Colors.themeColor,
        marginHorizontal: '7%',
        width: '86%',
        marginBottom:SH(60)
    },
})