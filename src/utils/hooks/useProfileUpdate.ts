import { useEffect, useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChatContext } from '../../screens/ChatProvider';
import { RootState, setUserProfileData, useGetUserProfileQuery } from '../../redux';
import { StorageProvider } from '..';

const useProfileUpdate = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: profileData, refetch } = useGetUserProfileQuery(undefined, {
    skip: !token,
  });

  const chatContext = useContext(ChatContext);
  const createUser = chatContext?.createUser;

  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Fetch FCM token once
  useEffect(() => {
    const getToken = async () => {
      const ftoken = await StorageProvider.getItem('fcmToken');
      setFcmToken(ftoken || null);
    };
    getToken();
  }, []);

  useEffect(() => {
    if (token && refetch) refetch();
  }, [token, refetch]);

  useEffect(() => {
    if (profileData?.success && profileData?.data?.user && createUser) {
      const user = profileData.data.user;
      dispatch(setUserProfileData(user));

      const userData = {
        name: user.fullName,
        email: user.email,
        mobileno: user.mobileNo,
        roleType: user.roleType,
        fcmToken: fcmToken,
        image: user?.profilePic
      };

      createUser(user._id, userData);
    }
  }, [profileData, createUser, dispatch, fcmToken]);

  
};

export default useProfileUpdate;
