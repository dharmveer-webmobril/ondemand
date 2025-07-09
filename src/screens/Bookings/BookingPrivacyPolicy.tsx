import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { AppHeader, AppText, Container } from '../../component'
import { Colors, Fonts, SF, SH } from '../../utils'
import { useNavigation, useRoute } from '@react-navigation/native';

export default function BookingPrivacyPolicy() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    let title = route?.params?.title
    return (
        <Container style={styles.container}>
            <AppHeader
                headerTitle={title}
                onPress={() => navigation.goBack()}
                Iconname="arrowleft"
                rightOnPress={() => { }}
                headerStyle={{ backgroundColor: '#ffffff', }}
                titleStyle={{ color: '#333', fontSize: SF(18) }}
            />
             <AppText style={styles.desc}>Lorem ipsum dolor sit amet consectetur. Elit quis gravida enim nunc sit etiam.. Pretium praesent mattis viverra sit feugiat volutpat amet.. In massa nec pharetra condimentum et morbi purus felis tempor.. Dui viverra amet nibheu. Ornare elit mi adipiscing consectetur dictum fermentum ut varius.. Id felis pellentesque dui commodo nisl volutpat sagittis.. Eleifend porta ccumsan dignissim ac augue iaculis justo eget habitant. Morbi nunc egestas nunc quam. Massa blandit malesuada morbi sit nullam mollis amet.. Orci faucibus posuere rutrum eu odio facilisi consequat.. In maecenas eu facilisis in nibh tincidunt.. Facilisis a mauris vestibulum dui molestie.. Risus ultricies ac vitae consectetur massa sit cursus nunc.. Maecenas tellus amet turpis purus. Vel leo facilisi quam facilisis mi elit.. Viverra a vehicula at varius quis morbi.. Nec mus arcu mi malesuada purus..
             Auctor dictumst nibh et scelerisque. Nunc mattis orci aliquam auctor vitae vitae.. Diam aenean sed in ut cursus at.. Placerat commodo sit aenean vulputate aliquet mollis risus.. Mauris nulla ut id nunc nunc consequat diam fusce. Bibendum vulppellentesque feugiat senectus.. Eget nunc et cursus pellentesque. Risus sem condimentum imperdiet amet adipiscing platea ut scelerisque eu.. Non vestibulum consectetur augue feugiat feugiat hac.. Porttitor turpis dui non commodo tellus at eu gravida quam.. Interdum tincidunt at nisl convallis. Arcu gravida semper diam praesent adipiscing neque tincidunt quis.. Enim fames nullam at vulputate venenatis.. A nulla morbi sed in ultricies ullamcorper pretium sit.. Quam quis diam platea egestas urna eget bibendum maecenas..</AppText>
        </Container>
    )
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.bgwhite,
        paddingHorizontal:'6%'
    },
    desc:{ fontFamily: Fonts.REGULAR, color: Colors.textAppColor, lineHeight: SH(20),marginHorizontal:"5%",marginTop:10 }
})