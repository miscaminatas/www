$(window).on("scroll",function(){var t=$(".nav-wrapper.stuck"),e=t.position().top,o=$(".nav-wrapper.scroll-nav"),a=$(window).scrollTop();$(window).width();a>=e?o.css("display","block"):e>a&&o.css("display","none");for(var l=[$(".item.one"),$(".item.two"),$(".item.three"),$(".item.four")],s=[$(".main-nav a.one"),$(".main-nav a.two"),$(".main-nav a.three"),$(".main-nav a.four")],i=0;i<l.length&&l[i].length>0;i++){var n=l[i].position().top-89;a<$(".item.one").offset().top-89&&$(".main-nav .active").toggleClass("active",!1),i==l.length-1?a>=n&&!s[i].hasClass("active")&&($(".main-nav .active").toggleClass("active",!1),s[i].toggleClass("active",!0)):(nextPosition=l[i+1].position().top,a>=n&&a<nextPosition&&!s[i].hasClass("active")&&($(".main-nav .active").toggleClass("active",!1),s[i].toggleClass("active",!0)))}}),$(document).ready(function(){$("a.one").click(function(){$("html, body").animate({scrollTop:$("div.part.one").offset().top-89},500)}),$("a.two").click(function(){$("html, body").animate({scrollTop:$("div.part.two").offset().top-89},500)}),$("a.three").click(function(){$("html, body").animate({scrollTop:$("div.part.three").offset().top-89},500)}),$("a.four").click(function(){$("html, body").animate({scrollTop:$("div.part.four").offset().top-89},500)}),$("a.five").click(function(){$("html, body").animate({scrollTop:$("div.part.five").offset().top-89},500)}),$("a.six").click(function(){$("html, body").animate({scrollTop:$("div.part.six").offset().top-89},500)}),$("a.seven").click(function(){$("html, body").animate({scrollTop:$("div.part.seven").offset().top-89},500)}),$("a.eight").click(function(){$("html, body").animate({scrollTop:$("div.part.eight").offset().top-89},500)}),$(".superscript").click(function(t){var e;if(-1!=$(this).text().indexOf("-"))e=$(this).text().split("-"),e=e[0];else if(-1!=$(this).text().indexOf(",")){var e=$(this).text().split(",");e=e[0]}else e=$(this).text();var o="reference"+e;$("html, body").animate({scrollTop:$("li#"+o).offset().top-100},500)}),$(window).scroll(function(){$(window).scrollTop()>=$("div.part.one").offset().top-101&&$(window).scrollTop()<$("div.part.two").offset().top-101?($(".nav-wrapper.scroll-nav:not(.featureIII) .selected").removeClass("selected"),$(".nav-wrapper.scroll-nav:not(.featureIII) a:first-child").addClass("selected")):$(window).scrollTop()>=$("div.part.two").offset().top-101&&$(window).scrollTop()<$("div.part.three").offset().top-101?($(".nav-wrapper.scroll-nav:not(.featureIII) .selected").removeClass("selected"),$(".nav-wrapper.scroll-nav:not(.featureIII) a:nth-child(2)").addClass("selected")):$(window).scrollTop()>=$("div.part.three").offset().top-101&&$(window).scrollTop()<$("div.part.four").offset().top-101?($(".nav-wrapper.scroll-nav:not(.featureIII) .selected").removeClass("selected"),$(".nav-wrapper.scroll-nav:not(.featureIII) a:nth-child(3)").addClass("selected")):$(window).scrollTop()>=$("div.part.three").offset().top-101&&($(".nav-wrapper.scroll-nav:not(.featureIII) .selected").removeClass("selected"),$(".nav-wrapper.scroll-nav:not(.featureIII) a:nth-child(4)").addClass("selected"))})});