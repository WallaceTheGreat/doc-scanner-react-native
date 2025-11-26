import { API_ENDPOINTS, buildApiUrl } from "@/constants/api";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export const BackCamView = () => {
	const [permission, requestPermission] = useCameraPermissions();
	const cameraRef = useRef<CameraView | null>(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [documentTitle, setDocumentTitle] = useState("");
	const [capturedPicture, setCapturedPicture] = useState<{ uri: string; base64?: string } | null>(null);
	const [isUploading, setIsUploading] = useState(false);

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

		try {
			const picture = await cameraRef.current.takePictureAsync({
				base64: true,
				quality: 0.8,
			});

			setCapturedPicture(picture);
			setIsModalVisible(true);
		} catch (error) {
			console.error("Error taking picture:", error);
			Alert.alert("Error", "Failed to take picture. Please try again.");
		}
	};

	const handleSubmitTitle = async () => {
		if (!documentTitle.trim()) {
			Alert.alert("Error", "Please enter a document title");
			return;
		}

		if (!capturedPicture) {
			Alert.alert("Error", "No picture captured");
			return;
		}

		setIsUploading(true);

		try {
			// Step 1: Create the document
			const documentUrl = buildApiUrl(API_ENDPOINTS.DOCUMENTS);
			const documentResponse = await fetch(documentUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					document: {
						title: documentTitle,
						path: documentTitle,
						created_by: 1,
					},
				}),
			});

			if (!documentResponse.ok) {
				const errorText = await documentResponse.text();
				throw new Error(`Failed to create document: ${documentResponse.statusText} - ${errorText}`);
			}

			// Step 2: Upload the image
			const uploadUrl = buildApiUrl(API_ENDPOINTS.DOCUMENTS_UPLOAD);
			const formData = new FormData();
			formData.append("file", {
				uri: capturedPicture.uri,
				name: `${Date.now()}.jpg`,
				type: "image/jpeg",
			} as any);

			const uploadResponse = await fetch(uploadUrl, {
				method: "POST",
				body: formData,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (!uploadResponse.ok) {
				const errorText = await uploadResponse.text();
				throw new Error(`Failed to upload image: ${uploadResponse.statusText} - ${errorText}`);
			}

			// Success
			Alert.alert("Success", "Document created and image uploaded successfully!");
			setIsModalVisible(false);
			setDocumentTitle("");
			setCapturedPicture(null);
		} catch (error) {
			console.error("Error uploading document:", error);
			Alert.alert("Error", error instanceof Error ? error.message : "Failed to upload document. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	const handleCloseModal = () => {
		if (!isUploading) {
			setIsModalVisible(false);
			setDocumentTitle("");
			setCapturedPicture(null);
		}
	};

	return (
		<View style={styles.container}>
			<CameraView ref={cameraRef} style={styles.preview} facing="back" />

			<TouchableOpacity style={styles.button} onPress={takePicture}>
				<Text style={styles.btnText}>oOo</Text>
			</TouchableOpacity>

			<Modal
				visible={isModalVisible}
				transparent={true}
				animationType="slide"
				onRequestClose={handleCloseModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Titre du document</Text>
						<TextInput
							style={styles.titleInput}
							placeholder="Enter document title..."
							value={documentTitle}
							onChangeText={setDocumentTitle}
							onSubmitEditing={handleSubmitTitle}
							returnKeyType="done"
							editable={!isUploading}
							autoFocus
						/>
						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.cancelButton]}
								onPress={handleCloseModal}
								disabled={isUploading}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.modalButton, styles.submitButton, isUploading && styles.submitButtonDisabled]}
								onPress={handleSubmitTitle}
								disabled={isUploading}
							>
								{isUploading ? (
									<ActivityIndicator size="small" color="#fff" />
								) : (
									<Text style={styles.submitButtonText}>Submit</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
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
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 24,
		width: "85%",
		maxWidth: 400,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 16,
		color: "#11181C",
	},
	titleInput: {
		height: 48,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 12,
		fontSize: 16,
		marginBottom: 20,
		backgroundColor: "#fff",
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 12,
	},
	modalButton: {
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
		minWidth: 80,
		alignItems: "center",
		justifyContent: "center",
	},
	cancelButton: {
		backgroundColor: "#f0f0f0",
	},
	cancelButtonText: {
		color: "#666",
		fontSize: 16,
		fontWeight: "600",
	},
	submitButton: {
		backgroundColor: "#0a7ea4",
	},
	submitButtonDisabled: {
		opacity: 0.6,
	},
	submitButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
