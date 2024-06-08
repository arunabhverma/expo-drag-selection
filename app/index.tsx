import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import SelectableFlatList from "@/components/SelectableFlatList";
import Animated, { withTiming } from "react-native-reanimated";

type imageItem = {
  author: string;
  download_url: string;
  height: number;
  id: string;
  url: string;
  width: number;
};

interface State_type {
  imageData: imageItem[] | null;
}

const { width, height } = Dimensions.get("window");

const Main = () => {
  const [state, setState] = useState<State_type>({
    imageData: null,
  });

  useEffect(() => {
    getImages();
  }, []);

  const getImages = () => {
    fetch("https://picsum.photos/v2/list?page=10&limit=50")
      .then((res) => res.json())
      .then((res) => setState((prev) => ({ ...prev, imageData: res })));
  };

  const renderItem = useCallback(
    ({ item, index, indexValue }: { item: imageItem; index: number }) => {
      return (
        <Animated.View>
          <Image
            source={{ uri: item.download_url }}
            style={{ width: width / 3, aspectRatio: 1 }}
          />
        </Animated.View>
      );
    },
    []
  );

  return (
    <View>
      <SelectableFlatList
        data={state.imageData}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        numColumns={3}
      />
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({});
