<template>
  <div class="pager" :class="{hide: hideIfOnePage && totalPage <= 1}">
    <span
      class="pager-item nav-icon prev-nav"
      @click="onClickPage(currentPage - 1)"
      :class="{hidden: currentPage === 1}"
      onclick="$('html,body').finish().animate({'scrollTop':'0px'},200);"
    >
      <i class="fa fa-long-arrow-left"></i>
    </span>
    <!-- <template v-for="(page, index) in pages">
      <template v-if="page === currentPage">
        <span :key="index" class="pager-item current">{{page}}</span>
      </template>
      <template v-else-if="page === '···'">
        <span class="pager-item separator" :key="index">···</span>
      </template>
      <template v-else>
        <span :key="index" class="pager-item other" @click="onClickPage(page)">{{page}}</span>
      </template>
    </template>-->
    <span
      class="pager-item nav-icon next-nav"
      @click="onClickPage(currentPage + 1)"
      :class="{hidden: currentPage === totalPage}"
      onclick="$('html,body').finish().animate({'scrollTop':'0px'},200);"
    >
      <i class="fa fa-long-arrow-right"></i>
    </span>
  </div>
</template>

<script>
export default {
  name: 'Pager',
  props: {
    totalPage: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    },
    hideIfOnePage: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    pages () {
      let pages = [
        1,
        this.totalPage,
        this.currentPage,
        this.currentPage - 1,
        this.currentPage - 2,
        this.currentPage + 1,
        this.currentPage + 2
      ]
      let u = unique(pages.filter((n) => n >= 1 && n <= this.totalPage).sort((a, b) => a - b))
      let u2 = u.reduce((prev, current, index, array) => {
        prev.push(current)
        if (
          array[index + 1] !== undefined &&
          array[index + 1] - array[index] > 1
        ) {
          prev.push('···')
        }
        return prev
      }, [])
      return u2
    }
  },
  methods: {
    onClickPage (n) {
      if (n >= 1 && n <= this.totalPage) {
        this.$emit('update:currentPage', n);

      }
    }
  }
}

function unique (array) {
  // return [...new Set(array)]
  const object = []
  array.map(number => {
    object[number] = true
  })
  return Object.keys(object).map(s => parseInt(s, 10))
}
</script>

<style lang="scss" scoped>
.pager {
  padding: 0;
  user-select: none;
  display: flex;
  justify-content: space-between;
  &.hide {
    display: none;
  }
  .pager-item {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    height: 36px;
    line-height: 36px;
    padding: 6px 14px;
    color: #444;
    margin: 0;
    cursor: pointer;
    &:not(.separator).current {
      cursor: default;
      background-color: #6f777d;
      color: #fff;
    }
  }
  .nav-icon {
    display: flex;
    justify-content: center;
    align-content: center;
    width: 50%;
    height: 50px;
    color: #6f777d;
    background: #eee;
    transition: all 0.2s linear;
    &:hover {
      background: #6f777d;
      color: #fff;
    }
  }
  .prev-nav {
    left: 0;
    border-right: 1px solid #eee;
  }
  .next-nav {
    right: 0;
  }
}
</style>
