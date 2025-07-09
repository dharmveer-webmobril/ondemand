import { View, Text } from 'react-native'
import React, { FC } from 'react'
import { AppText } from '../../component'

interface choosLanguageProps{

}
const ChooseLanguage:FC<choosLanguageProps>=()=> {
  return (
    <View>
      <AppText>ChooseLanguage</AppText>
    </View>
  )
}
export default ChooseLanguage