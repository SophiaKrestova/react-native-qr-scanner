import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function RootLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#007AFF",
				tabBarStyle: {
					backgroundColor: "#FFFFFF",
					elevation: 10,
					shadowOpacity: 0.1,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Сканер",
					headerShown: false,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="qr-code" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="history"
				options={{
					title: "Історія",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="time" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
