import {StyleSheet,View, Text} from "react-native";
import {useState } from "react";
import Slider from '@react-native-community/slider';

type Props = {
    numberDefault : number,
    min : number,
    max : number,
    numberActual : number,
    OnSlice : (numberActual : number) => (void);

}

export default function UnissonSlider({numberDefault, min, max, numberActual, OnSlice}:Props) {
    return (
        <View style={styles.input}>
                <Slider
                    style={styles.slicer}
                    minimumValue={min}
                    maximumValue={max}
                    step={1}
                    value={numberActual}
                    onValueChange={OnSlice}
                    minimumTrackTintColor="#f4a261"
                    maximumTrackTintColor="#ddd"
                    thumbTintColor="#e76f51"
                />
                <Text style={styles.text}>{numberActual}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        flexDirection: "row",
        alignItems: "center",
        height: 45,
        borderWidth: 2,
        borderColor: "#bbb",
        borderRadius: 11,
        paddingHorizontal: 20,
        fontSize: 16,
        backgroundColor: "#fff",
        margin : 8,
    },
    slicer: {
        flex: 1,
    },
    text: {
        fontSize: 16,
        marginLeft: 11,
        alignSelf:"center",
        minWidth: 20,
    }
})
