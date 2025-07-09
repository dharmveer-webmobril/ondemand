import imagePaths from "../assets/images";

export const currencyData = [
  {
    name: 'Canadian Dollor',
    id: 1,
    image: imagePaths.US_flag,
  },
  {
    name: 'US',
    id: 2,
    image: imagePaths.US_flag,
  },
  {
    name: 'Euro',
    id: 3,
    image: imagePaths.US_flag,
  },
  {
    name: 'GBP Pound',
    id: 4,
    image: imagePaths.US_flag,
  },
  {
    name: 'AUD',
    id: 4,
    image: imagePaths.US_flag,
  },
];

export const languageData = [
  {
    name: 'English',
    id: 1,
    image: imagePaths.US_flag,
  },
  {
    name: 'French (canada)',
    id: 2,
    image: imagePaths.US_flag,
  },
  {
    name: 'Spanish',
    id: 3,
    image: imagePaths.US_flag,
  },
  {
    name: 'Portuguese',
    id: 4,
    image: imagePaths.US_flag,
  },
  {
    name: 'Arabic',
    id: 5,
    image: imagePaths.US_flag,
  },
];

export const socialButtons = [
  {
    icon: imagePaths.google_icon,
    onPress: () => { },
  },
  {
    icon: imagePaths.fb_icon,
    onPress: () => { },
  },
  {
    icon: imagePaths.insta_icon,
    onPress: () => { },
  },
];

export const categoryData = [
  { image: imagePaths.plumb_img, name: 'Plumbing', id: 1 },
  { image: imagePaths.carpentry, name: 'Carpentry', id: 2 },
  { image: imagePaths.painting, name: 'Painting', id: 3 },
  { image: imagePaths.electrical, name: 'Electrical', id: 4 },
  { image: imagePaths.electrical, name: 'Electrical', id: 5 },
  { image: imagePaths.cleaning, name: 'Cleaning', id: 6 },
  { image: imagePaths.cleaning, name: 'Cleaning', id: 7 },
  { image: imagePaths.carpentry, name: 'Carpentry', id: 8 },
  { image: imagePaths.painting, name: 'Painting', id: 11 },
  { image: imagePaths.electrical, name: 'Electrical', id: 9 },
  { image: imagePaths.electrical, name: 'Electrical', id: 10 },
];



export const bookingData = [
  {
    id: "120",
    image: { uri: "https://via.placeholder.com/50" },
    name: "Ashutosh Pandey",
    job: "Cleaning Expert",
    location: "46144 Jules Terrace, South Amiyaborough, Mississippi - 90519, Belize",
    date: "02 February, 2022 at 8:30 AM",
  },
  {
    id: "121",
    image: { uri: "https://via.placeholder.com/50" },
    name: "Ashutosh Pandey",
    job: "Cleaning Expert",
    location: "33732 Park Avenue, Eliezerport, Kentucky - 80615, Slovakia",
    date: "02 February, 2022 at 8:30 AM",
  },
  {
    id: "122",
    image: { uri: "https://via.placeholder.com/50" },
    name: "Ashutosh Pandey",
    job: "Cleaning Expert",
    location: "46144 Jules Terrace, South Amiyaborough, Mississippi - 90519, Belize",
    date: "02 February, 2022 at 8:30 AM",
  },
];

export const serviceArr = [
  {
    image: imagePaths.electrical,
    name: 'Electrical',
    id: 1,
    rating: 4.5,
    ratingCount: 450,
    location: 'Ikeja, Nigeria',
    price: 80,
  },
  {
    image: imagePaths.plumb_img,
    name: 'Plumbing',
    id: 2,
    rating: 4.5,
    ratingCount: 450,
    location: 'Ikeja, Nigeria',
    price: 80,
  },
  {
    image: imagePaths.electrical,
    name: 'Electrical',
    id: 3,
    rating: 4.5,
    ratingCount: 450,
    location: 'Ikeja, Nigeria',
    price: 80,
  },
  {
    image: imagePaths.plumb_img,
    name: 'Plumbing',
    id: 4,
    rating: 4.5,
    ratingCount: 450,
    location: 'Ikeja, Nigeria',
    price: 80,
  },
  {
    image: imagePaths.electrical,
    name: 'Electrical',
    id: 5,
    rating: 4.5,
    ratingCount: 450,
    location: 'Ikeja, Nigeria',
    price: 80,
  },
];

export const messagesData = [
  {
    _id: 1,
    text: 'Hello! How can I help you today?',
    createdAt: new Date(),
    user: {
      _id: 2,
      name: 'Support',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
  },
  {
    _id: 2,
    text: 'Hi, I need some assistance with my order.',
    createdAt: new Date(Date.now() - 60 * 1000),
    user: {
      _id: 1,
      name: 'You',
    },
  },
  {
    _id: 3,
    text: 'Sure, I’d be happy to help. Could you provide your order number?',
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    user: {
      _id: 2,
      name: 'Support',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
  },
];
export const inboxData = [
  {
    id: '1',
    name: 'Jerry Walker',
    lastMessage: 'Hi last chat here',
    time: '4:14 pm',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    
  },
  {
    id: '2',
    name: 'Sharon Young',
    lastMessage: 'Hi last chat here',
    time: '4:14 pm',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '3',
    name: 'WM Berber',
    lastMessage: 'Hi last chat here',
    time: '4:14 pm',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '4',
    name: 'Mary Davis',
    lastMessage: 'Hi last chat here',
    time: '4:14 pm',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: '5',
    name: 'Jennifer',
    lastMessage: 'Hi last chat here',
    time: '4:14 pm',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
  {
    id: '6',
    name: 'Melissa Wilson',
    lastMessage: 'Hi last chat here',
    time: '4:14 pm',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
  },
  {
    id: '7',
    name: 'WM Berber',
    lastMessage: 'Hi last chat here',
    time: '4:14 pm',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '8',
    name: 'Mary Davis',
    lastMessage: 'Hi last chat here',
    time: '4:14 pm',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: '9',
    name: 'Jennifer',
    lastMessage: 'Hi last chat here',
    time: '4:14 pm',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
  {
    id: '10',
    name: 'Melissa Wilson',
    lastMessage: 'Hi last chat here',
    time: '4:14 pm',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
  },
];
export const inboxMenuData = [
  {
    id: 'delete',
    title: 'Delete Chat',
    icon: imagePaths.delete_icon,
  },
  {
    id: 'report',
    title: 'Report',
    icon: imagePaths.report_icon,
  },
  {
    id: 'block',
    title: 'Block',
    icon: imagePaths.block_icon,
  },
];
export const chatMenuData = [
  {
    id: 'delete',
    title: 'Mute Notification',
    icon: imagePaths.mute_icon,
  },
  {
    id: 'report',
    title: 'Delete Chat',
    icon: imagePaths.report_icon,
  },
  {
    id: 'block',
    title: 'Add Feedback',
    icon: imagePaths.feedback_icon,
  },
];


export const nearByData = [
  {
    image: `https://cdn.pixabay.com/photo/2024/02/15/13/52/students-8575444_1280.png`,
    name: 'Richar Kandowen',
    id: 1,
    rating: 4.5,
    ratingCount: 450,
    location: 'Ikeja, Nigeria',
    price: 80,
  },
  {
    image: 'https://cdn.pixabay.com/photo/2024/02/15/13/55/ai-generated-8575453_1280.png',
    name: 'Palmcedar Cleaning',
    id: 2,
    rating: 4.5,
    ratingCount: 450,
    location: 'Ikeja, Nigeria',
    price: 80,
  },
];
export const recommendedData = [
  { image: imagePaths.recomanded1, name: 'Plumbing', id: 1 },
  { image: imagePaths.recomanded2, name: 'Carpentry', id: 2 },
  { image: imagePaths.recomanded3, name: 'Painting', id: 3 },
  { image: imagePaths.recomanded1, name: 'Electrical', id: 4 },
  { image: imagePaths.recomanded3, name: 'Cleaning', id: 5 },
];
export const subCatDdata = [
  { text: 'All' },
  { text: 'Hair Salon' },
  { text: 'Barbershop' },
  { text: 'Skin care' },
  { text: 'Makeup' },
  { text: 'Barbershop' },
  { text: 'Skin care' },
  { text: 'Makeup' },
];
