import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type HistoryItem = {
	id: number;
	data: string;
	date: string;
};

const HISTORY_KEY = "qr_history";

export default function HistoryScreen() {
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const loadHistory = useCallback(async () => {
		setIsLoading(true);

		try {
			const stored = await AsyncStorage.getItem(HISTORY_KEY);
			const parsed: HistoryItem[] = stored
				? (JSON.parse(stored) as HistoryItem[])
				: [];

			setHistory(parsed);
		} catch (error) {
			Alert.alert("Помилка", "Не вдалося завантажити історію сканувань.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadHistory();
		}, [loadHistory])
	);

	const handleOpenItem = useCallback(async (value: string) => {
		const canOpen = await Linking.canOpenURL(value);

		if (!canOpen) {
			Alert.alert("Дані сканування", value);
			return;
		}

		await Linking.openURL(value);
	}, []);

	const handleClearHistory = useCallback(() => {
		Alert.alert("Очистити історію", "Ви справді хочете видалити історію?", [
			{
				text: "Скасувати",
				style: "cancel",
			},
			{
				text: "Видалити",
				style: "destructive",
				onPress: async () => {
					await AsyncStorage.removeItem(HISTORY_KEY);
					setHistory([]);
				},
			},
		]);
	}, []);

	const renderItem = useCallback(
		({ item }: { item: HistoryItem }) => (
			<Pressable
				style={styles.card}
				onPress={() => {
					handleOpenItem(item.data);
				}}
			>
				<Text style={styles.cardTitle} numberOfLines={2}>
					{item.data}
				</Text>
				<Text style={styles.cardDate}>{item.date}</Text>
			</Pressable>
		),
		[handleOpenItem]
	);

	if (!history.length && !isLoading) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>
					Ваша історія сканувань порожня 📭
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={history}
				keyExtractor={(item) => String(item.id)}
				renderItem={renderItem}
				contentContainerStyle={styles.listContent}
				refreshing={isLoading}
				onRefresh={loadHistory}
				ListFooterComponent={
					history.length ? (
						<Pressable style={styles.clearButton} onPress={handleClearHistory}>
							<Text style={styles.clearButtonText}>Очистити історію</Text>
						</Pressable>
					) : null
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F2F2F7",
	},
	listContent: {
		padding: 16,
		paddingBottom: 32,
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		shadowColor: "#000000",
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 12,
		elevation: 4,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1C1C1E",
	},
	cardDate: {
		marginTop: 6,
		fontSize: 13,
		color: "#8E8E93",
	},
	emptyContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#F2F2F7",
		paddingHorizontal: 24,
	},
	emptyText: {
		fontSize: 16,
		color: "#8E8E93",
		textAlign: "center",
	},
	clearButton: {
		marginTop: 8,
		backgroundColor: "#FF3B30",
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: "center",
	},
	clearButtonText: {
		color: "#FFFFFF",
		fontSize: 15,
		fontWeight: "600",
	},
});
