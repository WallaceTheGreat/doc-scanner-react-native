import { Platform, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {BackCamView} from "@/components/camera-back";

export default function HomeScreen() {
	return (
		<ThemedView style={styles.container}>
			<BackCamView />
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
});
