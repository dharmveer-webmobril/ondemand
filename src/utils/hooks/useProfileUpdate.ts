// import { useEffect, useContext } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useGetUserProfileQuery } from '../../services';
// import { ChatContext } from '../../screens/ChatProvider';
// import { RootState, setUserProfileData } from '../../redux';

// const useProfileUpdate = () => {
//   const dispatch = useDispatch();
//   const token = useSelector((state: RootState) => state.auth.token);
//   const { data: profileData, refetch } = useGetUserProfileQuery(undefined, {
//     skip: !token,
//   });

//   const chatContext = useContext(ChatContext);
//   if (!chatContext) return null;
//   const { createUser } = chatContext;

//   useEffect(() => {
//     if (token) refetch();
//   }, [token]);

//   useEffect(() => {
//     if (profileData && profileData.succeeded) {
//       profileData?.ResponseBody && dispatch(setUserProfileData(profileData?.ResponseBody))
//       const userData = {
//         name: profileData?.ResponseBody?.full_name,
//         email: profileData?.ResponseBody?.email,
//         mobileno: profileData?.ResponseBody?.mobile,
//       };
//       createUser(profileData?.ResponseBody?._id, userData);
//     }
//   }, [profileData]);
// };

// export default useProfileUpdate;

const useProfileUpdate = () => {}
export default useProfileUpdate;