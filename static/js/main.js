$(function () {

  $(window).on("scroll", function () {
    if ($(window).scrollTop() >= 60) {
      $('header').addClass('scrollhead')
    } else {
      $('header').removeClass('scrollhead')
    }
  });

  var s1 = '2021-10-14';
  s1 = new Date(s1.replace(/-/g, "/"));
  s2 = new Date();
  var days = s2.getTime() - s1.getTime();
  var number_of_days = parseInt(days / (1000 * 60 * 60 * 24));
  document.getElementById('days').innerHTML = number_of_days;

  var i = 1;
  $('.menu-icon').click(function () {
    if (i == 1) {
      $('.nav-menu').addClass('menu-show')
      $('.menu-icon').addClass('menu-icon-show')
      $('.opacity').css('display', 'block')
      i = 2
    } else {
      $('.nav-menu').removeClass('menu-show')
      $('.menu-icon').removeClass('menu-icon-show')
      $('.opacity').css('display', 'none')
      i = 1
    }
  })
  $('.opacity').click(function () {
    $('.nav-menu').removeClass('menu-show')
    $('.menu-icon').removeClass('menu-icon-show')
    $('.opacity').css('display', 'none')
    i = 1
  })

  var str = '';
  function nuxt_shuoshuo () {
    $.ajax({
      url: 'https://imhan.cn/api/nuxt_shuoshuo.php',
      type: 'get',
      dataType: 'json',
      async: false,
      success: function (data) {
        $.each(data, function (i, item) {
          list = "<div class='item " + item.authorId + "'>" +
            "<div class='img'><img src='https://img.imhan.cn/default.png'></div>" +
            "<div class='content'><p class='author'>" + item.author + "</p>" +
            "<p class='text'>" + item.text + "</p>" +
            "<p class='date'>" + item.created + "</p></div>" +
            "</div>"
          str += list;
        }),
          $("#nuxt_shuoshuo").html(str);
      },
      error: function () {
        console.log('数据请求失败')
      }

    });
  }
  nuxt_shuoshuo();
  $('.item.1>.img>img').attr('src', 'https://img.imhan.cn/author.png')
  $('.item.2>.img>img').attr('src', 'https://img.imhan.cn/caicai.png')
});



