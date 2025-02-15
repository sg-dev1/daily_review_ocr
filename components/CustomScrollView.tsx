import React, { PropsWithChildren } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';

type Props = PropsWithChildren<{}>;

const CustomScrollView = ({ children }: Props) => {
  const bottom = useBottomTabOverflow();

  return (
    <View style={styles.container}>
      <ScrollView
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
        centerContent={true}
      >
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
    paddingTop: StatusBar.currentHeight,
  },
  content: {
    flex: 1,
    paddingTop: 45,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    gap: 16,
    //minHeight: '80%',
    //overflow: 'hidden',
    //justifyContent: 'space-between',
    //alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

export default CustomScrollView;
