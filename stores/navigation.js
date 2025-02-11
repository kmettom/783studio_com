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
      expanded: false,
      inTransition: false,
      activeProjectName: null,
      activeProjectsIndex: 0
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
    setProjectsExpanded(expanded) {
      this.projects.expanded = expanded;
    },
    setProjectsInTransition(inTransition) {
      this.projects.inTransition = inTransition;
    },
    setActiveProjectName(name) {
      this.projects.activeProjectName = name;
    },
  },
});
