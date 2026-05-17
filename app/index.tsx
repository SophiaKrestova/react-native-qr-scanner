import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Linking,
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
const SCAN_BOX_SIZE = 250;

const formatDateTime = (date: Date) => {
	const pad = (value: number) => String(value).padStart(2, "0");
	const day = pad(date.getDate());
	const month = pad(date.getMonth() + 1);
	const year = date.getFullYear();
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());

	return `${day}.${month}.${year}, ${hours}:${minutes}`;
};

export default function ScannerScreen() {
	const [permission, requestPermission] = useCameraPermissions();
	const [scanningEnabled, setScanningEnabled] = useState(true);

	const scanBoxStyle = useMemo(
		() => ({ width: SCAN_BOX_SIZE, height: SCAN_BOX_SIZE }),
		[]
	);

	const scanLineStyle = useMemo(
		() => ({ width: SCAN_BOX_SIZE - 12 }),
		[]
	);

	const resumeScanning = useCallback(() => {
		setScanningEnabled(true);
	}, []);

	const handleOpenUrl = useCallback(async (data: string) => {
		const canOpen = await Linking.canOpenURL(data);

		if (!canOpen) {
			Alert.alert("Помилка", "Це не URL-адреса.");
			return;
		}

		await Linking.openURL(data);
	}, []);

	const handleBarCodeScanned = useCallback(
		async ({ data }: { data: string }) => {
			if (!scanningEnabled) {
				return;
			}

			setScanningEnabled(false);

			const now = new Date();
			const entry: HistoryItem = {
				id: now.getTime(),
				data,
				date: formatDateTime(now),
			};

			try {
				const existing = await AsyncStorage.getItem(HISTORY_KEY);
				const history: HistoryItem[] = existing
					? (JSON.parse(existing) as HistoryItem[])
					: [];

				await AsyncStorage.setItem(
					HISTORY_KEY,
					JSON.stringify([entry, ...history])
				);
			} catch (error) {
				Alert.alert("Помилка", "Не вдалося зберегти історію сканувань.");
			}

			Alert.alert("QR-код знайдено", data, [
				{
					text: "Сканувати ще",
					onPress: resumeScanning,
				},
				{
					text: "Відкрити URL",
					onPress: () => {
						handleOpenUrl(data);
					},
				},
			]);
		},
		[handleOpenUrl, resumeScanning, scanningEnabled]
	);

	if (!permission || !permission.granted) {
		const message = permission
			? "Потрібен доступ до камери для сканування."
			: "Перевіряємо доступ до камери...";

		return (
			<View style={styles.permissionContainer}>
				<Text style={styles.permissionText}>{message}</Text>
				<Button title="Дозволити камеру" onPress={requestPermission} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<CameraView
				style={StyleSheet.absoluteFillObject}
				barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
				onBarcodeScanned={scanningEnabled ? handleBarCodeScanned : undefined}
			/>
			<View style={styles.overlay}>
				<View style={styles.overlayTop} />
				<View style={styles.overlayMiddle}>
					<View style={styles.overlaySide} />
					<View style={[styles.scanBox, scanBoxStyle]}>
						<View style={[styles.scanLine, scanLineStyle]} />
					</View>
					<View style={styles.overlaySide} />
				</View>
				<View style={styles.overlayBottom}>
					<Text style={styles.instructionText}>
						Наведіть камеру на QR-код
					</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000000",
	},
	permissionContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	permissionText: {
		fontSize: 16,
		color: "#1C1C1E",
		marginBottom: 16,
		textAlign: "center",
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
	},
	overlayTop: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.55)",
	},
	overlayMiddle: {
		flexDirection: "row",
		height: SCAN_BOX_SIZE,
	},
	overlaySide: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.55)",
	},
	overlayBottom: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.55)",
		alignItems: "center",
		paddingTop: 20,
	},
	scanBox: {
		borderWidth: 2,
		borderColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "transparent",
	},
	scanLine: {
		height: 2,
		backgroundColor: "#007AFF",
	},
	instructionText: {
		color: "#FFFFFF",
		fontSize: 16,
		textAlign: "center",
	},
});
