import { View, StyleSheet } from 'react-native';
import React from 'react';
import { boxShadow, boxShadowlight, Colors, Fonts, SF, SH, SW } from '../../utils';
import Swiper from 'react-native-swiper';
import ImageLoader from '../ImageLoader';

interface swiperData {
  id: number,
  imgUrl: any
}
interface HomeSwiperProps {
  swiperData: swiperData[]
}

const HomeSwiper: React.FC<HomeSwiperProps> = ({ swiperData }) => {
  return (
    <Swiper
      showsButtons={false}
      style={styles.wrapper}
      pagingEnabled={true}
      autoplay
      dot={<View style={styles.dot} />}
      activeDot={<View style={styles.activeDot} />}
      paginationStyle={styles.paginationStyle}>
      {swiperData.map((item: swiperData) => {
        return (
          <View style={[styles.slide]} key={item.id}>
            <View style={[styles.imageBox,boxShadowlight]}>
              <ImageLoader resizeMode="cover" mainImageStyle={styles.image} source={item.imgUrl} />
            </View>
          </View>
        );
      })}
    </Swiper>
  );
};
export default HomeSwiper;

const styles = StyleSheet.create({
  wrapper: {
    height: SF(160),
  },
  dot: {
    backgroundColor: Colors.gray1,
    width:SF(10),
    height:SF(10),
    borderRadius:SF(10) / 2,
    marginLeft: SF(3),
    marginRight: SF(3),
    marginBottom: -SF(35),
  },
  activeDot: {
    backgroundColor: Colors.themeColor,
    width: SF(10),
    height: SF(10),
    borderRadius: SF(10) / 2,
    marginLeft: SF(3),
    marginRight: SF(3),
    
    marginBottom: -SF(35),
  },
  paginationStyle: {
    bottom: 0,
  },
  slide: {
    height: SF(160),
    borderRadius: SF(10),
    paddingHorizontal: '7%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageBox:{
    borderRadius: 10,
    overflow:'hidden',
    backgroundColor:"red"
  },
});
