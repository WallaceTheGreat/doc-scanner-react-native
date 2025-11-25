import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useCameraPermissions, CameraView } from "expo-camera";
import { useEffect, useRef } from "react";

export const BackCamView = () => {
	const [permission, requestPermission] = useCameraPermissions();
	const cameraRef = useRef<CameraView | null>(null);

	useEffect(() => {
		if (!permission) return;
		if (!permission.granted) requestPermission();
	}, [permission]);

	if (!permission) {
		return <Text>Checking permissions</Text>;
	}

	if (!permission.granted) {
		return (
			<TouchableOpacity onPress={requestPermission}>
				<Text>not allowed</Text>
			</TouchableOpacity>
		);
	}

	return (
		<View style={styles.container}>
			<CameraView
				ref={cameraRef}
				style={styles.preview}
				facing="back"
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#000" },
	preview: { flex: 1 },
});
