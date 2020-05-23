export default {
  data: () => ({
    viewport: [0, 0]
  }),
  created () {
    window.addEventListener('resize', this.setViewport.bind(this))
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.setViewport.bind(this))
  },
  methods: {
    setViewport () { 
      if (!this.$el || !this.$el.parentElement) return
      const { offsetWidth, offsetHeight } = this.$el.parentElement
      this.viewport = [offsetWidth, offsetHeight]
    }
  }
}