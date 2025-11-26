import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackCamView } from "@/components/camera-back";

export default function HomeScreen() {
	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<BackCamView />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
});
