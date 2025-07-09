import React, {  useState } from 'react';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Colors,
  Fonts,
  SF,
  SH,
} from '../../utils';
import {
  AppHeader,
  AppText,
  Container,
} from '../../component';
import { useNavigation, useRoute } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
type PrivacyPolicyProps = {};

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ }) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  let title = route?.params?.title
  const [data, setData] = useState(null)





  return (
    <Container style={styles.container}>
      <AppHeader
        headerTitle={title}
        onPress={() => navigation.goBack()}
        Iconname="arrowleft"
        rightOnPress={() => { }}
        headerStyle={{ backgroundColor: '#ffffff',  }}
        titleStyle={{ color: '#333', fontSize: SF(18) }}
      />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {
          data ?
            <RenderHtml
              contentWidth={400}
              source={{
                html: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
                // html: `${data}`
              }}
            /> :
            <AppText style={{ fontFamily: Fonts.REGULAR, lineHeight: SH(20), color: Colors.textAppColor }}>Something went wrong</AppText>
        }
        
       
      </ScrollView>
    </Container>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgwhite,
  },
});
