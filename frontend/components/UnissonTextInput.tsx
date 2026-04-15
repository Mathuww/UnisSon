import {StyleSheet, TextInput} from "react-native";

type Props = {
    labelDefault : string,
    text : string,
    OnWrite : (text:string) => void;
}

export default function UnissonTextInput({labelDefault, text, OnWrite}:Props) {
    return (
        <>
            <TextInput
                style={styles.input}
                placeholder={labelDefault}
                value={text}
                onChangeText={OnWrite}
                placeholderTextColor="#999"
            />
        </>
    );
}

const styles = StyleSheet.create({
    input: {
        height: 50,
        borderWidth: 2,
        borderColor: '#bbb',
        borderRadius: 11,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        padding : 11,
        margin  : 8,
    },
})
