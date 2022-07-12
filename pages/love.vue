<template>
  <div>
    <HeaderMe />
    <div class="wrapper">
      <PageSidebar />
      <div class="archive">
        <div class="article-content markdown-body" v-html="article.html"></div>
        <div class="iframe">
          <iframe src="https://love.imhan.cn" frameborder="0" width="100%"></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderMe from "@/components/HeaderMe";
import PageSidebar from '@/components/PageSidebar';
export default {
  components: {
    HeaderMe,
    PageSidebar,
  },
  async asyncData ({ params }) {
    // 调用 about.md 内的数据
    const article = await import(`~/content/love.md`);
    return {
      article
    };
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
  .archive {
    padding: 25px 2% 15px;
    .article-content {
      line-height: 2;
      color: inherit;
      margin-top: 20px;
    }
    .iframe {
      padding-bottom: 100%;
    }
  }
}
</style>