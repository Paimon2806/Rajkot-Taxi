// import { useEffect, useState } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "./config/firebaseConfig";
//
// export default function App() {
//   const [user, setUser] = useState(null);
//
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//     });
//
//     return () => unsubscribe();
//   }, []);
//
//   return (
//     <NavigationContainer>
//       {user ? <AppNavigator /> : <LoginScreen />}
//     </NavigationContainer>
//   );
// }
