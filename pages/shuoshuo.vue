<template>
  <div>
    <HeaderMe />
    <div class="wrapper">
      <PageSidebar />
      <div class="archive">
        <h2>{{ article.attributes.title }}</h2>
        <div class="article-content markdown-body" v-html="article.html"></div>
        <!-- <div class="login">
          <a href="https://note.imhan.cn/">去发布</a>
        </div> -->
        <div id="nuxt_shuoshuo">
          <div class="spinner">
            <div class="rect1"></div>
            <div class="rect2"></div>
            <div class="rect3"></div>
            <div class="rect4"></div>
            <div class="rect5"></div>
          </div>
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
    // 调用 shuoshuo.md 内的数据
    const article = await import(`~/content/shuoshuo.md`);
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
      font-size: inherit;
      line-height: 1.8;
      color: inherit;
      margin-top: 20px;
    }
  }
  .login {
    text-align: right;
    a {
      margin-right: 6px;
      background: #f3f3f3;
      padding: 2px 12px;
      border-radius: 4px;
    }
  }
}
</style>