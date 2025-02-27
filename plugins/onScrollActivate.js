import { Canvas } from '~/utils/canvas.js';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('onScrollActivate', {
    mounted(el, binding) {
      setTimeout(() => {
        el.dataset.scrollActivateId = crypto.randomUUID();
        Canvas.addOnScrollActivateElement({
          elNode: el,
          options: binding.value,
          arg: binding.arg,
        });
      }, 150);
    },
    updated(el, binding) {
      Canvas.updateOnScrollActiveElement({
        elNode: el,
        options: binding.value,
        arg: binding.arg,
      });
    },
    unmounted(el) {
      Canvas.removeScrollActiveElement(el);
    },
  });
});

// const onScrollActivateOptions = {
//   activeRange: Number,
//   activateOnce: Boolean, // default false
//   activateCallback: String,
//   trackOnly: Boolean,
//   bidirectionalActivation: Boolean (default: false),
//   activeRangeOrigin: Number (0-1, 0 from top of screen, 1 bottom of the screen)
//   activeRangeMargin: Number
//   scrollSpeed: Number,
//   fixToParentId: Boolean,
//   scrollCallback: string
// }
