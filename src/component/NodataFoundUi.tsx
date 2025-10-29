import { View, Image } from 'react-native';
import React from 'react';
import { imagePaths, SW, SH, SF, Fonts, Colors } from '../utils';
import AppText from './AppText';
import VectorIcon from './VectoreIcons';
import Buttons from './Button';

type Props = {
    height?: number;
    width?: number;
    text?: string;
    isError?: boolean;
    onErrorFun?: () => void;
    errorButtonText?: string;
    isErrorButtonShow?: boolean;

    onEmptyFun?: () => void;
    emptyButtonText?: string;


    messageText?: string
};

export default function NodataFoundUi({ height, width, text, isError, onErrorFun = () => { }, errorButtonText = "", onEmptyFun = () => { }, emptyButtonText = '', messageText = "" }: Props) {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <>
                {
                    isError ? <>
                        <Image
                            source={imagePaths.error}
                            style={{
                                height: height ? height : SW(60),
                                width: width ? width : SW(60),
                                resizeMode: 'contain',
                            }}
                        />
                        <AppText style={{
                            fontSize: SF(16),
                            fontFamily: Fonts.MEDIUM,
                            color: Colors.textAppColor,
                            textAlign: 'center',
                            marginTop: 5
                        }}>
                            Oops!
                        </AppText>
                        <AppText style={{
                            fontSize: SF(12),
                            fontFamily: Fonts.REGULAR,
                            color: Colors.textAppColor,
                            textAlign: 'center',
                            marginVertical: 5
                        }}>
                            Something wents wrong!
                        </AppText>
                        {errorButtonText && <Buttons
                            buttonStyle={{ height: 33, borderRadius: 6, marginTop: 5 }}
                            paddingHorizontal={SW(10)}
                            buttonTextStyle={{ fontSize: SF(12), }}
                            title={errorButtonText}
                            onPress={() => onErrorFun()}
                        />}
                    </>
                        :
                        <>

                            <Image
                                source={imagePaths.empty_item}
                                style={{
                                    height: height ? height : SW(60),
                                    width: width ? width : SW(60),
                                    resizeMode: 'contain',
                                }}
                            />

                            {messageText && <AppText style={{
                                fontSize: SF(12),
                                fontFamily: Fonts.REGULAR,
                                color: Colors.textAppColor,
                                textAlign: 'center',
                                marginVertical: 5
                            }}>
                                {messageText}
                            </AppText>}
                            {emptyButtonText && <Buttons
                                paddingHorizontal={SW(10)}
                                buttonStyle={{ height: 33, borderRadius: 6, marginTop: 5 }}
                                buttonTextStyle={{ fontSize: SF(12), }}
                                title={emptyButtonText}
                                onPress={() => onEmptyFun()}
                            />}
                        </>
                }

            </>
        </View>
    );
}
