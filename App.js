import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import SplashScreen   from './src/screens/SplashScreen';
import HomeScreen     from './src/screens/HomeScreen';
import NewsScreen     from './src/screens/NewsScreen';
import ProfileScreen  from './src/screens/ProfileScreen';
import ProgramsScreen from './src/screens/ProgramsScreen';
import ServicesScreen from './src/screens/ServicesScreen';

import { colors } from './src/theme';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Main tab navigator (3 tabs like the reference) ──────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBg,
          borderTopColor:  colors.tabBorder,
          borderTopWidth:  1,
          height:          64,
          paddingBottom:   10,
          paddingTop:      8,
        },
        tabBarActiveTintColor:   colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize:    11,
          fontWeight:  '600',
          letterSpacing: 0.2,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home:    focused ? 'home'      : 'home-outline',
            News:    focused ? 'newspaper' : 'newspaper-outline',
            Profile: focused ? 'person'    : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    />
      <Tab.Screen name="News"    component={NewsScreen}    />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── Root stack (Splash → Main + sub-screens) ────────────────────────
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"   component={SplashScreen}   />
        <Stack.Screen name="Main"     component={MainTabs}        />
        <Stack.Screen
          name="Programs"
          component={ProgramsScreen}
          options={{
            headerShown: true,
            title: 'Health Programs',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: colors.primary,
            headerTitleStyle: { fontWeight: '800' },
          }}
        />
        <Stack.Screen
          name="Services"
          component={ServicesScreen}
          options={{
            headerShown: true,
            title: 'City Services',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: colors.primary,
            headerTitleStyle: { fontWeight: '800' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
