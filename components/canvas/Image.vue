<template>
  <div ref="imageWrapper" class="webgl-img-wrapper">
    <NuxtImg
      class="webgl-img"
      :width="width"
      :height="height"
      alt="picture"
      :src="srcLink"
      @load="imageLoaded"
    />
  </div>
</template>

<script setup>
import { Canvas } from '~/utils/canvas';

const props = defineProps({
  srcLink: {
    type: String,
    required: true,
  },
  shader: {
    type: String,
    default: 'default',
  },
  imageHover: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '100%',
  },
});

const generateRandomId = () => {
  return Math.floor(Math.random() * 100000);
};

const meshIdRandom = ref(generateRandomId() + props.srcLink);
const generatedMeshId = ref(props.srcLink + meshIdRandom.value);

const imageWrapper = ref('imageWrapper');
const imgLoaded = ref(false);

// const imageWidth = computed(() => {
//   if (imageWrapper.value)
//     imageWrapper.value.children[0]?.getBoundingClientRect()?.width ?? 0;
// });
// const imageHeight = computed(() => {
//   imageWrapper.value.children[0]?.getBoundingClientRect()?.height
// })

onMounted(async () => {
  addImageToCanvas(false);
});

const addImageToCanvas = (_timeout) => {
  setTimeout(
    () => {
      if (
        !imageWrapper.value ||
        imageWrapper.value.children[0]?.getBoundingClientRect()?.width === 0
      ) {
        addImageToCanvas(true);
        return;
      }
      Canvas.addImageAsMesh(
        imageWrapper.value.children[0],
        props.shader,
        generatedMeshId.value,
        false,
      );
    },
    _timeout ? 200 : 0,
  );
};

const imageLoaded = () => {
  imgLoaded.value = true;
};

watch(
  () => props.imageHover,
  (_status) => {
    Canvas.hoverMesh(generatedMeshId.value, _status);
  },
);

onBeforeUnmount(() => {
  Canvas.removeMesh(generatedMeshId.value);
});
</script>

<style lang="scss" scoped>
.webgl-img-wrapper {
  border: 1px solid green;
}
.webgl-img {
  max-width: 100%;
  max-height: 100%;
  opacity: 0;
  //border: 1px solid green
}
</style>
