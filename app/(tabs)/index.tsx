import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BackCamView } from "@/components/camera-back";

export default function HomeScreen() {
	return (
		<View style={styles.container}>
			<BackCamView />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
		padding: 16,
	},
});
