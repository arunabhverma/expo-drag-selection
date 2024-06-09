import { Dimensions, FlatListProps, StyleSheet, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  ReduceMotion,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
type SelectableFlatListProps<T> = FlatListProps<T>;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const WIDTH = Dimensions.get("window").width;

const SelectableFlatList = <T,>(props: SelectableFlatListProps<T>) => {
  const theme = useTheme();
  const animatedRef = useAnimatedRef();
  const containerWidth = useSharedValue(0);
  const containerHeight = useSharedValue(0);
  const offset = useSharedValue({ x: 0, y: 0 });
  const indexValue = useSharedValue({ min: 0, max: 0 });
  const scrollOffset = useSharedValue(0);
  const isDragStart = useSharedValue(false);
  let scrollViewLength =
    (Math.ceil(props.data?.length / 3) * WIDTH) / 3 - containerHeight.value;

  const [min, setMin] = useState(null);
  const [max, setMax] = useState(null);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.y;
  });

  useDerivedValue(() => {
    if (offset.value.y > containerHeight.value * 0.9) {
      let scrollOffsetValue =
        scrollOffset.value >= scrollViewLength
          ? scrollOffset.value
          : scrollOffset.value + 10;
      scrollTo(animatedRef, 0, scrollOffsetValue, false);
    }
    if (offset.value.y < containerHeight.value * 0.1) {
      let scrollOffsetValue =
        scrollOffset.value <= 0 ? 0 : scrollOffset.value - 10;
      scrollTo(animatedRef, 0, scrollOffsetValue, false);
    }
  });

  const getValue = useDerivedValue(() => {
    let numCol = 3;
    let itemWidth = containerWidth.value / numCol;
    let itemHeight = itemWidth;

    let col = Math.ceil(offset.value.x / itemWidth) || 1;
    let row =
      Math.ceil((offset.value.y + scrollOffset.value) / itemHeight) || 1;

    let count = (row - 1) * 3 + col;

    return count;
  });

  const dragGesture = Gesture.Pan()
    .onStart((e) => {
      if (isDragStart.value) {
        offset.value = {
          x: offset.value.x + e.translationX,
          y: offset.value.y + e.translationY,
        };

        let minVal = getValue.value;
        indexValue.value.min = minVal;
        runOnJS(setMin)(minVal);
        runOnJS(setMax)(minVal);
      }
    })
    .onChange((e) => {
      if (isDragStart.value) {
        offset.value = {
          x: offset.value.x + e.changeX,
          y: offset.value.y + e.changeY,
        };
        let maxVal = getValue.value;
        indexValue.value.max = maxVal;
        runOnJS(setMax)(maxVal);
      }
    })
    .onFinalize(() => {
      isDragStart.value = false;
    });

  const longPressGesture = Gesture.LongPress().onStart((e) => {
    runOnJS(setMin)(null);
    runOnJS(setMax)(null);
    offset.value = {
      x: e.x,
      y: e.y,
    };

    let numCol = 3;
    let itemWidth = containerWidth.value / numCol;
    let itemHeight = itemWidth;

    let col = Math.ceil(e.x / itemWidth) || 1;
    let row = Math.ceil((e.y + scrollOffset.value) / itemHeight) || 1;

    let count = (row - 1) * 3 + col;

    isDragStart.value = true;

    indexValue.value.max = count;
    runOnJS(setMin)(count);
    runOnJS(setMax)(count);
  });

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

  const renderItem = useCallback(
    ({ item, index }) => {
      const itemIndex = index + 1;
      const active =
        min && max
          ? (min <= itemIndex && itemIndex <= max) ||
            (max <= itemIndex && itemIndex <= min)
          : false;
      return (
        <Animated.View style={{ width: WIDTH / 3, aspectRatio: 1 }}>
          {active && (
            <View
              style={{
                position: "absolute",
                backgroundColor: "rgba(255,255,255,0.5)",
                zIndex: 10,
                ...StyleSheet.absoluteFill,
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  position: "absolute",
                  width: 25,
                  height: 25,
                  bottom: 5,
                  right: 5,
                  borderRadius: 25,
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.primary}
                  // color={"white"}
                />
              </View>
            </View>
          )}
          <Image source={{ uri: item.download_url }} style={{ flex: 1 }} />
        </Animated.View>
      );
    },
    [min, max]
  );

  const composed = Gesture.Simultaneous(dragGesture, longPressGesture);

  return (
    <View style={{ flexGrow: 1 }} onLayout={onLayout}>
      <GestureDetector gesture={composed}>
        <AnimatedFlatList
          //   const animatedRef = useAnimatedRef();
          ref={animatedRef}
          {...props}
          onScroll={scrollHandler}
          renderItem={renderItem}
        />
      </GestureDetector>
    </View>
  );
};

export default SelectableFlatList;

const styles = StyleSheet.create({});
