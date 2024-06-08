import {
  Dimensions,
  FlatListProps,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Image } from "expo-image";
import {
  FlatList,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type SelectableFlatListProps<T> = FlatListProps<T>;

const WIDTH = Dimensions.get("window").width;

const RenderItem = ({ item, index, indexValue }) => {
  console.log("indexValue", indexValue);

  let padding = {
    padding: indexValue.min <= index + 1 && indexValue.max >= index + 1 ? 1 : 0,
  };

  return (
    <Animated.View style={padding}>
      <Image
        source={{ uri: item.download_url }}
        style={{ width: WIDTH / 3, aspectRatio: 1 }}
      />
    </Animated.View>
  );
};

const SelectableFlatList = <T,>(props: SelectableFlatListProps<T>) => {
  const containerWidth = useSharedValue(0);
  const containerHeight = useSharedValue(0);
  const offset = useSharedValue({ x: 0, y: 0 });

  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);

  const indexValue = useSharedValue({ min: 0, max: 0 });

  const getValue = useDerivedValue(() => {
    let numCol = 3;
    let itemWidth = containerWidth.value / numCol;
    let itemHeight = itemWidth;

    let col = Math.ceil(offset.value.x / itemWidth);
    let row = Math.ceil(offset.value.y / itemHeight);

    let count = (row - 1) * 3 + col;
    return count;
  });

  const pan = Gesture.Pan()
    .onStart((e) => {
      offset.value = {
        x: offset.value.x + e.translationX,
        y: offset.value.y + e.translationY,
      };

      runOnJS(setMin)(getValue.value);

      //   indexValue.value.min = getValue.value;
    })
    .onChange((e) => {
      offset.value = {
        x: offset.value.x + e.changeX,
        y: offset.value.y + e.changeY,
      };
      runOnJS(setMax)(getValue.value);
      //   indexValue.value.max = getValue.value;
    })
    .onFinalize(() => {});

  const onLayout = useCallback((e) => {
    const containerLayout = e.nativeEvent.layout;
    containerWidth.value = containerLayout.width;
    containerHeight.value = containerLayout.height;
  }, []);

  const animatedDragStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
      ],
    };
  });

  //   const animatedStyle = useAnimatedStyle(() => {
  //     return {
  //       padding: padding,
  //       backgroundColor: "blue",
  //     };
  //   });

  return (
    <View
      style={{ flexGrow: 1, padding: 10, backgroundColor: "red" }}
      onLayout={onLayout}
    >
      <GestureDetector gesture={pan}>
        <View>
          <Animated.View
            style={[
              {
                width: 100,
                aspectRatio: 1,
                backgroundColor: "blue",
                position: "absolute",
                zIndex: 10,
              },
              animatedDragStyle,
            ]}
          />
          <Animated.FlatList
            {...props}
            // renderItem={({ item, index }) =>
            //   props.renderItem({ item, index, indexValue })
            // }
            renderItem={({ item, index }) => (
              <RenderItem item={item} index={index} indexValue={{ min, max }} />
            )}
          />
        </View>
      </GestureDetector>
    </View>
  );
};

export default SelectableFlatList;

const styles = StyleSheet.create({});
