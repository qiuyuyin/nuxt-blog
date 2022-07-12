<template>
  <div>
    <HeaderMe />
    <PageSidebar />
    <div v-for="archive in archives" :key="archive.year">
      <h1 class="index-h1">{{ archive.year }}</h1>
      <div class="wrapper">
        <article
          class="article"
          v-for="article in archive.archives"
          :key="article.title"
        >
          
          <nuxt-link class="link" :to="article.path">
            <div class="article-title">
              <span>{{ article.title }}</span>
            </div>
            <div class="article-date">{{ formatDate(article.date) }}</div>
          </nuxt-link>

          <!-- <div class="article-content" v-html="article.summary"></div> -->
        </article>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderMe from "@/components/HeaderMe";
import PageSidebar from "@/components/PageSidebar";
import Pager from "@/components/Pager";
import { perHomeCount } from "@/config";
import {
  getArticles,
  getPagerCount,
  formatDate,
  getAllYearTitle,
} from "@/util";

export default {
  components: {
    HeaderMe,
    PageSidebar,
    Pager,
  },
  async asyncData({ $content }) {
    let content = await $content("posts").sortBy("date", "desc").fetch();
    content =  content.filter((ar)=>{
      return ar.private == null
    })
    const res = getAllYearTitle(content);
    return {
      archives: res,
    };
  },
  data() {
    return {
      currentPage: 1,
    };
  },
  computed: {
    pagerCount() {
      return getPagerCount(this.allArticles.length, perHomeCount);
    },
  },
  methods: {
    updatePage(page) {
      this.currentPage = page;
      this.articles = getArticles(page, perHomeCount, this.allArticles);
    },
    formatDate(date) {
      return formatDate(date);
    },
    getAllYearTitle(array) {
      return getAllYearTitle(array);
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  margin-top: 0px !important;
  padding-top: 2px;
  .article:nth-of-type(1) {
    margin-top: 6px;
  }
  .article {
    padding: 0 4%;
    opacity: 0.98;
    transition: all 0.2s linear;
    margin-bottom: 6px;
    position: relative;
    display: flex;
    align-items: center;
    &:hover {
      background: rgb(229, 231, 235);
    }
    .link {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        height: 1px;
        width: 100%;
        background: #eee;
      }
      &:hover {
        opacity: 1;
        .article-title {
          span {
            &::after {
              width: 100%;
            }
          }
        }
      }
      .article-title {
        margin: 0;
        padding: 14px 0;
        font-weight: 500;
        font-size: 22px;
        color: #000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s linear;
        span {
          position: relative;
          &::after {
            content: "";
            width: 0;
            height: 2px;
            background: var(--bg-main);
            position: absolute;
            left: 0;
            bottom: 0;
            transition: all 0.2s linear;
          }
        }
      }
      .article-date {
        color: #000;
        font-size: 0.94rem;
        opacity: 0.8;
        font-weight: 500;
        text-decoration: none;
      }
      .article-content {
        font-size: 15px !important;
        line-height: 1.77;
        color: inherit;
        text-justify: distribute;
        word-break: break-all;
        text-align: left;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        opacity: 0.9;
        color: #3e3939;
      }
    }
    .article-meta {
      padding: 0;
      color: #6e7173;
      font-size: 0.94em;
      text-indent: 0.15em;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      opacity: 0.8;
      .article-category {
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
    }
  }
  .navigator {
    list-style: none;
    margin-top: 25px;
    padding: 25px 0 0;
    font-size: 14px;
    text-align: center;
  }
}
.index-h1 {
  font-size: 30px !important;
}
@media (max-width: 520px) {
  .wrapper {
    .article {
      padding-bottom: 10px;
      border-radius: 0;
      align-items: baseline;
      .link {
        flex-direction: column;
        align-items: flex-start;
        .article-title {
          padding: 8px 0;
        }
        .article-date {
          width: 100%;
          text-align: left;
        }
      }
    }
  }
}
</style>
