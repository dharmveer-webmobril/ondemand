// components/TeamMemberSelector.tsx
import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { AppText, Spacing, TeamMemberProfile } from '../../component';
import { Colors, Fonts, imagePaths, SF, SH, SW } from '../../utils';
import { useTranslation } from 'react-i18next';

interface TeamMemberSelectorProps {
  membersListData: any[];
  selectedMember: any;
  onMemberSelect: (member: any) => void;
  isMultiple: boolean;
}

const TeamMemberSelector: React.FC<TeamMemberSelectorProps> = ({
  membersListData,
  selectedMember,
  onMemberSelect,
  isMultiple,
}) => {
  const { t } = useTranslation();

  if (isMultiple) return null;

  return (
    <>
      <AppText style={[styles.subHeader, { marginTop: SH(10) }]}>
        {t('bookAppointment.subHeader')}
      </AppText>
      <Spacing space={SH(15)} />
      <View style={styles.memberRow}>
        <FlatList
          data={membersListData}
          keyExtractor={(item) => item?._id + 'team-member'}
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              <TeamMemberProfile
                selectedMember={selectedMember?._id || ''}
                onClick={() => onMemberSelect(item)}
                imageSource={
                  item?._id === 'anyone'
                    ? imagePaths?.no_user_img
                    : item?.profilePic
                    ? { uri: item?.profilePic }
                    : imagePaths?.no_user_img
                }
                title={item?.fullName}
                item={item}
              />
            </View>
          )}
          ListEmptyComponent={() => (
            <AppText
              style={{
                color: Colors.lightGraytext,
                fontFamily: Fonts.MEDIUM,
                fontSize: SF(12),
              }}
            >
              {t('bookAppointment.messages.noTeamMembers')}
            </AppText>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.memberListContent}
        />
      </View>
    </>
  );
};

export default TeamMemberSelector;

const styles = StyleSheet.create({
  subHeader: {
    color: Colors.textAppColor,
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(12),
  },
  memberRow: {
    marginLeft: -SW(15),
    flexDirection: 'row',
  },
  memberItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SW(15),
  },
  memberListContent: {
    paddingTop: SH(10),
    paddingBottom: SH(5),
    paddingRight: SW(15),
    paddingLeft: 10,
  },
});