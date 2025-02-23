import {
  activeProjectTransition,
  nonActiveProjectTransition,
  openGalleryTransition,
  showGalleryControls,
} from '~/utils/animations/projects';

export const useNavigationStore = defineStore('navigationStore', {
  state: () => ({
    activeNavItem: 'home',
    navVisible: true,
    navContrastSwitched: false,
    navigationItems: [
      { name: 'Home', id: 'home' },
      { name: 'About', id: 'about' },
      { name: 'Work', id: 'work' },
      { name: 'Services', id: 'services' },
      { name: 'Contact us', id: 'contact' },
    ],
    projects: {
      galleryOpen: false,
      navigationVisible: false,
      htmlRefs: undefined,
      activeProject: { index: 0, ref: null },
      pastActiveProject: { index: 0, ref: null },
    },
    // navItems: ['home', 'about', 'work', 'services' , 'contact'],
  }),
  actions: {
    setActiveNavItem(id) {
      this.activeNavItem = id;
    },
    setNavVisible(visible) {
      this.navVisible = visible;
    },
    setNavContrast(contrastSwitched) {
      this.navContrastSwitched = contrastSwitched;
    },
    setProjectRefs(refs) {
      this.projects.htmlRefs = refs;
    },
    async openGalleryProject(index) {
      if (!this.projects.galleryOpen) {
        await openGalleryTransition(true);
        this.projects.galleryOpen = true;
      }
      this.setActiveProject(index);
      this.setGalleryNavigationVisible(true);
    },
    async closeGallery() {
      this.projects.galleryOpen = false;
      this.setGalleryNavigationVisible(false);
      this.setActiveProject(null);
      await openGalleryTransition(false);
    },
    setGalleryNavigationVisible(visible) {
      this.projects.navigationVisible = visible;
      showGalleryControls(visible);
    },
    goToProject(vector) {
      const scrollDuration = 0.5;
      const projectMargin = index === 0 ? 0 : 100;
      const index = this.projects.activeProject.index + vector;
      const projectPosition =
        this.projects.htmlRefs[index].getBoundingClientRect().top +
        window.scrollY -
        projectMargin;
      Canvas.scrollTo(projectPosition, scrollDuration);
    },
    async setActiveProject(index) {
      this.projects.pastActiveProject = { ...this.projects.activeProject };
      if (index === null) {
        this.projects.activeProject.index = 0;
        this.projects.activeProject.ref = null;
      } else {
        this.projects.activeProject.index = index;
        this.projects.activeProject.ref = this.projects.htmlRefs[index];
        activeProjectTransition(this.projects.activeProject.ref);
      }
      if (this.projects.pastActiveProject.ref)
        nonActiveProjectTransition(this.projects.pastActiveProject.ref);
    },
  },
});
