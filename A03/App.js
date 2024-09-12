import React, { useEffect } from "react";
import { StatusBar } from 'react-native';
import { NavigationContainer, useNavigation, DrawerActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; 
import { StyleSheet } from "react-native"; 
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
// Import các trang
import DrawerList from "./DrawerContent";
import HomePage from "./screens/HomePage";
import IntroductionPage from "./screens/IntroductionPage";
import LoginPage from "./screens/LoginPage";
import RegisterPage from "./screens/RegisterPage";
import ForgotPassword from "./screens/ForgotPassword";
import ProfilePage from "./screens/ProfilePage"; 
import EditProfile from "./screens/EditProfile";
import { createDrawerNavigator, DrawerContent } from "@react-navigation/drawer";
const StackNav=()=>{
  const Stack = createNativeStackNavigator();
  const navigation=useNavigation();
  return (<>
  <StatusBar
        barStyle="dark-content" // Chọn kiểu nội dung cho thanh trạng thái
        backgroundColor="white" // Màu nền của thanh trạng thái
        translucent={false}
      />
      
  <Stack.Navigator initialRouteName="Login"
    
    screenOptions={{
       
      backgroundColor: "white",
      headerStyle: {
        backgroundColor: "#0163d2",
      },
      headerTintColor: "#fff",
      headerTitleAlign: "center",
      
    }}
    >
    <Stack.Screen name="Login" component={LoginPage}/>
    <Stack.Screen name="Introduction" component={IntroductionPage}/>
    <Stack.Screen name="Register" component={RegisterPage} />
    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />  
    <Stack.Screen name="Home" component={HomePage} options={{
      headerLeft: () => {
        return (
          <Icon
          name="menu"
          onPress={()=>navigation.dispatch(DrawerActions.openDrawer)}
          size={30}
          color="#fff"
          />
        )
      }
    }}
    
    />
    <Stack.Screen name="Profile" component={ProfilePage}/>
    <Stack.Screen name="Edit" component={EditProfile}/>
  </Stack.Navigator>
  </>
  )
}

// Tạo Stack Navigator



const DrawerNav=() => {
  const Drawer=createDrawerNavigator();
  return( <>
  <StatusBar
        barStyle="dark-content" // Chọn kiểu nội dung cho thanh trạng thái
        backgroundColor="white" // Màu nền của thanh trạng thái
        translucent={false}
      />
  <Drawer.Navigator 
  drawerContent={props => <DrawerList {...props} />}
      screenOptions={{
       headerShown:false 
      }}>
        <Drawer.Screen name="Home" component={StackNav} />
        
      
    </Drawer.Navigator>
    </>
    
      
  )
}

export default function App() {
  
  return (
    <NavigationContainer>
      <DrawerNav/>
    </NavigationContainer>
    
  );
}

// Định nghĩa các style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
