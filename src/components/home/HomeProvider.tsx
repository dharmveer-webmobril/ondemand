import { View, FlatList } from 'react-native'
import { useThemeContext } from '@utils/theme';
import HomeProviderItem from './HomeProviderItem';
export default function HomeProvider() {
  const theme = useThemeContext();
  return (
    <View style={{ paddingHorizontal: 20, alignSelf: 'center', backgroundColor: '#EEF6F9', flex: 1, paddingVertical: 20 }}>
      <FlatList
        data={[1, 3, 4]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => 'home-provider' + index}
        renderItem={() => {
          return <HomeProviderItem />
        }}
      />
    </View>
  )
}
