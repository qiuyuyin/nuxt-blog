<template>
  <div class="header-me">
    <p>
      <nuxt-link class="article-title" to="/">伊离</nuxt-link>
    </p>
    <!-- <div class="article-meta">
      <div class="article-category">
        <nuxt-link to="/categories/技术">技术</nuxt-link>
        <nuxt-link to="/categories/随笔">随笔</nuxt-link>
      </div>
    </div> -->
    <p>殷勤昨夜三更雨，又得浮生一日凉。</p>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.header-me {
  p {
    text-align: center;
    margin-top: 14px;
    .article-title {
      display: inline-block;
      margin: 0;
      color: var(--color-main);
      font-weight: 500;
      font-size: 24px;
      line-height: 1.2;
      padding: 8px 0;
    }
  }
  .article-meta {
    padding: 0;
    margin: 6px 0;
    color: #6e7173;
    font-size: 15px;
    text-indent: 0.15em;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    opacity: 0.8;
    .article-category {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      a {
        display: inline-block;
        margin-right: 6px;
        padding: 0 6px;
        color: #6e7173;
        &:hover {
          color: #000;
        }
      }
    }
  }
}
</style>
