import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  errorTextContainer: {
    flex: 1,
    fontSize: 20,
    backgroundColor: 'red',
    color: 'white',
    padding: 15,
    margin: 5,
  },
  formRowContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  formLabel: {
    flex: 1,
    fontSize: 20,
  },
  formTextInput: {
    flex: 3,
    borderWidth: 1,
    borderColor: 'blue',
    padding: 5,
    borderRadius: 10,
  },
  buttonContainer: {
    //flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'blue',
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
