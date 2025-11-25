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

	const takePicture = async () => {
		if (!cameraRef.current) return;

		const picture = await cameraRef.current.takePictureAsync({
			base64: true,
			quality: 0.8,
		});

		const form = new FormData();
		form.append("file", {
			uri: picture.uri,
			name: `${Date.now()}.jpg`,
			type: "image/jpeg",
		} as any);

		await fetch(process.env.API_URL, {
			method: "POST",
			body: form,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	};

	return (
		<View style={styles.container}>
			<CameraView ref={cameraRef} style={styles.preview} facing="back" />

			<TouchableOpacity style={styles.button} onPress={takePicture}>
				<Text style={styles.btnText}>oOo</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#000" },
	preview: { flex: 1 },
	button: {
		position: "absolute",
		bottom: 40,
		alignSelf: "center",
		padding: 16,
		backgroundColor: "#ffffff88",
		borderRadius: 12,
	},
	btnText: {
		fontSize: 18,
		fontWeight: "bold",
	},
});
