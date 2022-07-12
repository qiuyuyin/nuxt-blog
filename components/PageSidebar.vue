<template>
  <div class="post-sidebar">
    <div class="list">
      <div
        class="back_top top-btn item"
        @mouseover="enterBackTop"
        @mouseout="outBackTop"
        ref="backTop"
        :style="{ opacity: opacity }"
        v-show="gotop"
        @click="handleScrollTop"
      >
        <i class="fa fa-angle-double-up"></i>
        <p>回到顶部</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["ele"],
  data () {
    return {
      opacity: "1",
      gotop: false,
      scrollHeight: 140,
      scrollTop: 0,
    };
  },
  mounted () {
    window.addEventListener("scroll", this.handleScroll, true);
  },
  methods: {
    enterBackTop () {
      this.opacity = "1";
    },
    outBackTop () {
      this.opacity = "1";
    },
    handleScroll (e) {
      const that = this;
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      that.scrollTop = scrollTop;
      that.scrollTop > this.scrollHeight
        ? (this.gotop = true)
        : (this.gotop = false);
    },
    handleScrollTop () {
      const that = this;
      const timer = setInterval(() => {
        const ispeed = Math.floor(-that.scrollTop / 5);
        document.documentElement.scrollTop = document.body.scrollTop =
          that.scrollTop + ispeed;
        if (that.scrollTop === 0) {
          clearInterval(timer);
        }
      }, 16);
    },
  },
};
</script>

<style lang="scss" scoped>
.post-sidebar {
  position: sticky;
  top: 209px;
  margin-left: 100%;
  height: 0;
  padding-bottom: 0;
  .list {
    margin-left: 10px;
    .item {
      background: #fff;
      box-shadow: 0 0 8px #ccc;
      width: 40px;
      height: 40px;
      border-radius: 6px;
      margin-top: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.2s linear;
      position: relative;
      a {
        transition: 0ms;
        color: inherit;
      }
      p {
        position: absolute;
        left: 50px;
        width: auto;
        white-space: nowrap;
        background: #6f777d;
        padding: 2px 10px;
        text-align: center;
        border-radius: 4px;
        font-size: 14px;
        color: #fff;
        display: none;
      }
      &:hover {
        cursor: pointer;
        background: #6f777d;
        color: #fff;
        p {
          display: block;
        }
      }
    }
  }
}
@media (max-width: 930px) {
  .post-sidebar {
    position: fixed;
    right: 10px;
    z-index: 11;
    .list {
      .item {
        p {
          display: none;
        }
      }
    }
  }
}
</style>