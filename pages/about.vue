<template>
  <div>
    <HeaderMe />
    <div class="wrapper">
      <PageSidebar />
      <div class="archive">
        <h2>{{ article.attributes.title }}</h2>
        <div class="article-content markdown-body" v-html="article.html"></div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderMe from "@/components/HeaderMe";
import PageSidebar from "@/components/PageSidebar";
export default {
  components: {
    HeaderMe,
    PageSidebar,
  },
  async asyncData({ params }) {
    // 调用 about.md 内的数据
    const article = await import(`~/content/about.md`);
    return {
      article,
    };
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  .archive {
    padding: 25px 2% 15px;
    .article-content {
      font-size: inherit;
      line-height: 2;
      color: inherit;
      margin-top: 20px;
    }
  }
}
.me-category {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .link {
    margin-right: 6px;
    background: #f3f3f3;
    padding: 0 8px;
    border-radius: 4px;
  }
}
</style>
