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
        this.projects.galleryOpen = true;
        this.setNavVisible(false);
        await openGalleryTransition(true);
        this.setGalleryNavigationVisible(true);
      }
      if (this.project.activeProject.index !== index) {
        await this.setActiveProject(index);
      }
    },
    async closeGallery() {
      this.projects.galleryOpen = false;
      this.setGalleryNavigationVisible(false);
      this.closeActiveProject();
      await openGalleryTransition(false);
      this.setNavVisible(true);
    },
    setGalleryNavigationVisible(visible) {
      this.projects.navigationVisible = visible;
      showGalleryControls(visible);
    },
    goToProject(index, ref) {
      const scrollDuration = 0.5;
      const projectMargin = index === 0 ? 0 : 100;
      const projectPosition =
          ref.getBoundingClientRect().top +
        window.scrollY -
        projectMargin;
      Canvas.scrollTo(projectPosition, scrollDuration);
    },
    setActiveProject(index) {
      if (!this.projects.galleryOpen) return;
      this.projects.pastActiveProject = { ...this.projects.activeProject };
      this.projects.activeProject.index = index;
      this.projects.activeProject.ref = this.projects.htmlRefs[index];
      this.goToProject( index, this.projects.activeProject.ref);
      activeProjectTransition(this.projects.activeProject.ref);
    },
    closeActiveProject() {
      this.projects.pastActiveProject = { ...this.projects.activeProject };
      this.projects.activeProject.index = 0;
      this.projects.activeProject.ref = null;
      nonActiveProjectTransition(this.projects.pastActiveProject.ref);
    },
  },
});
