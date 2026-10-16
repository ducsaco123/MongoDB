(function ($) {
  "use strict";

  // Spinner
  var spinner = function () {
    setTimeout(function () {
      if ($("#spinner").length > 0) {
        $("#spinner").removeClass("show");
      }
    }, 1);
  };
  spinner(0);

  // Fixed Navbar
  $(window).scroll(function () {
    if ($(window).width() < 992) {
      if ($(this).scrollTop() > 55) {
        $(".fixed-top").addClass("shadow");
      } else {
        $(".fixed-top").removeClass("shadow");
      }
    } else {
      if ($(this).scrollTop() > 55) {
        $(".fixed-top").addClass("shadow").css("top", 0);
      } else {
        $(".fixed-top").removeClass("shadow").css("top", 0);
      }
    }
  });

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });
  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    return false;
  });

  // Testimonial carousel
  $(".testimonial-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 2000,
    center: false,
    dots: true,
    loop: true,
    margin: 25,
    nav: true,
    navText: [
      '<i class="bi bi-arrow-left"></i>',
      '<i class="bi bi-arrow-right"></i>',
    ],
    responsiveClass: true,
    responsive: {
      0: {
        items: 1,
      },
      576: {
        items: 1,
      },
      768: {
        items: 1,
      },
      992: {
        items: 2,
      },
      1200: {
        items: 2,
      },
    },
  });

  // vegetable carousel
  $(".vegetable-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1500,
    center: false,
    dots: true,
    loop: true,
    margin: 25,
    nav: true,
    navText: [
      '<i class="bi bi-arrow-left"></i>',
      '<i class="bi bi-arrow-right"></i>',
    ],
    responsiveClass: true,
    responsive: {
      0: {
        items: 1,
      },
      576: {
        items: 1,
      },
      768: {
        items: 2,
      },
      992: {
        items: 3,
      },
      1200: {
        items: 4,
      },
    },
  });

  // Modal Video
  $(document).ready(function () {
    var $videoSrc;
    $(".btn-play").click(function () {
      $videoSrc = $(this).data("src");
    });
    console.log($videoSrc);

    $("#videoModal").on("shown.bs.modal", function (e) {
      $("#video").attr(
        "src",
        $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0",
      );
    });

    $("#videoModal").on("hide.bs.modal", function (e) {
      $("#video").attr("src", $videoSrc);
    });
  });

  // Product Quantity
  // $('.quantity button').on('click', function () {
  //     var button = $(this);
  //     var oldValue = button.parent().parent().find('input').val();
  //     if (button.hasClass('btn-plus')) {
  //         var newVal = parseFloat(oldValue) + 1;
  //     } else {
  //         if (oldValue > 0) {
  //             var newVal = parseFloat(oldValue) - 1;
  //         } else {
  //             newVal = 0;
  //         }
  //     }
  //     button.parent().parent().find('input').val(newVal);
  // });
  $(".quantity button").on("click", function () {
    let change = 0;

    var button = $(this);
    var oldValue = button.parent().parent().find("input").val();
    if (button.hasClass("btn-plus")) {
      var newVal = parseFloat(oldValue) + 1;
      change = 1;
    } else {
      if (oldValue > 1) {
        var newVal = parseFloat(oldValue) - 1;
        change = -1;
      } else {
        newVal = 1;
      }
    }
    const input = button.parent().parent().find("input");
    input.val(newVal);

    //set form index
    const index = input.attr("data-cart-detail-index");
    const el = document.getElementById(`cartDetails[${index}]`);
    $(el).val(newVal);

    //set quantity for detail page
    const elDetail = document.getElementById(`quantityDetail`);
    if (elDetail) {
      $(elDetail).val(newVal);
    }

    //get price
    const price = input.attr("data-cart-detail-price");
    const id = input.attr("data-cart-detail-id");

    const priceElement = $(`p[data-cart-detail-id='${id}']`);
    if (priceElement) {
      const newPrice = +price * newVal;
      priceElement.text(formatCurrency(newPrice));
    }

    //update total cart price
    const totalPriceElement = $(`p[data-cart-total-price]`);

    if (totalPriceElement && totalPriceElement.length) {
      const currentTotal = totalPriceElement
        .first()
        .attr("data-cart-total-price");
      let newTotal = +currentTotal;
      if (change === 0) {
        newTotal = +currentTotal;
      } else {
        newTotal = change * +price + +currentTotal;
      }

      //reset change
      change = 0;

      //update
      totalPriceElement?.each(function (index, element) {
        //update text
        $(totalPriceElement[index]).text(formatCurrency(newTotal));

        //update data-attribute
        $(totalPriceElement[index]).attr("data-cart-total-price", newTotal);
      });
    }
  });

  function formatCurrency(value) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  }

  //add active class to header
  const navElement = $("#navbarCollapse");
  const currentUrl = window.location.pathname;
  navElement.find("a.nav-link").each(function () {
    const link = $(this); // Get the current link in the loop
    const href = link.attr("href"); // Get the href attribute of the link

    if (href === currentUrl) {
      link.addClass("active"); // Add 'active' class if the href matches the current URL
    } else {
      link.removeClass("active"); // Remove 'active' class if the href does not match
    }
  });

  //handle filter products
  $("#btnFilter").click(function (event) {
    event.preventDefault();

    let factoryArr = [];
    let targetArr = [];
    let priceArr = [];
    //factory filter
    $("#factoryFilter .form-check-input:checked").each(function () {
      factoryArr.push($(this).val());
    });

    //target filter
    $("#targetFilter .form-check-input:checked").each(function () {
      targetArr.push($(this).val());
    });

    //price filter
    $("#priceFilter .form-check-input:checked").each(function () {
      priceArr.push($(this).val());
    });

    //sort order
    let sortValue = $('input[name="radio-sort"]:checked').val();

    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;

    // Reset page to 1 when applying new filter
    searchParams.set("page", "1");
    searchParams.set("sort", sortValue);

    //reset
    searchParams.delete("factory");
    searchParams.delete("target");
    searchParams.delete("price");

    if (factoryArr.length > 0) {
      searchParams.set("factory", factoryArr.join(","));
    }

    if (targetArr.length > 0) {
      searchParams.set("target", targetArr.join(","));
    }

    if (priceArr.length > 0) {
      searchParams.set("price", priceArr.join(","));
    }

    // Update the URL and reload the page
    window.location.href = currentUrl.toString();
  });

  //handle auto checkbox after page loading
  // Parse the URL parameters
  const params = new URLSearchParams(window.location.search);

  // Set checkboxes for 'factory'
  if (params.has("factory")) {
    const factories = params.get("factory").split(",");
    factories.forEach((factory) => {
      $(`#factoryFilter .form-check-input[value="${factory}"]`).prop(
        "checked",
        true,
      );
    });
  }

  // Set checkboxes for 'target'
  if (params.has("target")) {
    const targets = params.get("target").split(",");
    targets.forEach((target) => {
      $(`#targetFilter .form-check-input[value="${target}"]`).prop(
        "checked",
        true,
      );
    });
  }

  // Set checkboxes for 'price'
  if (params.has("price")) {
    const prices = params.get("price").split(",");
    prices.forEach((price) => {
      $(`#priceFilter .form-check-input[value="${price}"]`).prop(
        "checked",
        true,
      );
    });
  }

  // Set radio buttons for 'sort'
  if (params.has("sort")) {
    const sort = params.get("sort");
    $(`input[type="radio"][name="radio-sort"][value="${sort}"]`).prop(
      "checked",
      true,
    );
  }

  // Modern Toast Notification Plugin
  $.toast = function (options) {
    if (typeof options === "string") {
      options = { text: options };
    }
    const settings = $.extend(
      {
        heading: "",
        text: "",
        icon: "info",
        position: "top-right",
        hideAfter: 3500,
        loader: true,
      },
      options
    );

    // Auto-detect icon if not explicitly set
    if (!options.icon) {
      const headingLower = (settings.heading || "").toLowerCase();
      const textLower = (settings.text || "").toLowerCase();
      if (
        headingLower.includes("lỗi") ||
        textLower.includes("lỗi") ||
        textLower.includes("thất bại")
      ) {
        settings.icon = "error";
      } else if (
        headingLower.includes("thành công") ||
        textLower.includes("thành công") ||
        headingLower.includes("giỏ hàng")
      ) {
        settings.icon = "success";
      } else {
        settings.icon = "info";
      }
    }

    // Ensure container exists
    const containerClass = "app-toast-container " + settings.position;
    let $container = $("." + settings.position + ".app-toast-container");
    if (!$container.length) {
      $container = $("<div>", {
        class: containerClass,
      }).appendTo("body");
    }

    // Icon HTML
    let iconHtml = '<i class="fas fa-info-circle"></i>';
    if (settings.icon === "error") {
      iconHtml = '<i class="fas fa-exclamation-circle"></i>';
    } else if (settings.icon === "success") {
      iconHtml = '<i class="fas fa-check-circle"></i>';
    } else if (settings.icon === "warning") {
      iconHtml = '<i class="fas fa-exclamation-triangle"></i>';
    }

    // Check if login prompt should show direct link
    const isLoginError =
      settings.icon === "error" &&
      (settings.text.toLowerCase().includes("đăng nhập") ||
        settings.heading.toLowerCase().includes("đăng nhập"));

    // Build toast element
    const $toast = $(`
      <div class="app-toast app-toast--${settings.icon}" role="alert" aria-live="assertive">
        <div class="app-toast-icon">${iconHtml}</div>
        <div class="app-toast-content">
          ${settings.heading ? `<h4 class="app-toast-heading">${settings.heading}</h4>` : ""}
          <p class="app-toast-text">${settings.text}</p>
          ${isLoginError ? `<a href="/login" class="app-toast-action"><i class="fas fa-sign-in-alt me-1"></i>Đăng nhập ngay</a>` : ""}
        </div>
        <button type="button" class="app-toast-close" aria-label="Đóng thông báo"><i class="fas fa-times"></i></button>
        ${settings.loader ? `<div class="app-toast-loader"><div class="app-toast-loader-bar" style="animation-duration: ${settings.hideAfter}ms"></div></div>` : ""}
      </div>
    `);

    $container.append($toast);

    // Trigger smooth entrance
    setTimeout(function () {
      $toast.addClass("app-toast--show");
    }, 15);

    // Timer management with pause-on-hover
    let timer = null;
    let startTime = Date.now();
    let remaining = settings.hideAfter;

    function startTimer() {
      if (settings.hideAfter && settings.hideAfter > 0) {
        timer = setTimeout(function () {
          closeToast();
        }, remaining);
      }
    }

    function closeToast() {
      if (timer) clearTimeout(timer);
      $toast.removeClass("app-toast--show").addClass("app-toast--hide");
      setTimeout(function () {
        $toast.remove();
        if (!$container.children().length) {
          $container.remove();
        }
      }, 350);
    }

    // Close on button click
    $toast.find(".app-toast-close").on("click", function () {
      closeToast();
    });

    // Pause on hover
    $toast.on("mouseenter", function () {
      if (timer) clearTimeout(timer);
      remaining -= Date.now() - startTime;
      if (remaining < 500) remaining = 500;
    });

    $toast.on("mouseleave", function () {
      startTime = Date.now();
      startTimer();
    });

    startTimer();
    return $toast;
  };

  //handle add to cart with ajax
  $(".btnAddToCartHomepage").click(function (event) {
    event.preventDefault();

    if (!isLogin()) {
      $.toast({
        heading: "Lỗi thao tác",
        text: "Bạn cần đăng nhập tài khoản",
        position: "top-right",
        icon: "error",
      });
      return;
    }

    const productId = $(this).attr("data-product-id");

    $.ajax({
      url: `${window.location.origin}/api/add-product-to-cart`,
      type: "POST",
      data: JSON.stringify({ quantity: 1, productId }),
      contentType: "application/json",

      success: function (response) {
        const sum = +response.data;
        //update cart
        $("#sumCart").text(sum);
        //show message
        $.toast({
          heading: "Giỏ hàng",
          text: "Thêm sản phẩm vào giỏ hàng thành công",
          position: "top-right",
          icon: "success",
        });
      },
      error: function (response) {
        $.toast({
          heading: "Có lỗi xảy ra",
          text: "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.",
          position: "top-right",
          icon: "error",
        });
        console.log("error: ", response);
      },
    });
  });

  $(".btnAddToCartDetail").click(function (event) {
    event.preventDefault();

    if (!isLogin()) {
      $.toast({
        heading: "Lỗi thao tác",
        text: "Bạn cần đăng nhập tài khoản",
        position: "top-right",
        icon: "error",
      });
      return;
    }

    const productId = $(this).attr("data-product-id");
    const quantity = $("#detailQuantity").val() || 1;

    $.ajax({
      url: `${window.location.origin}/api/add-product-to-cart`,
      type: "POST",
      data: JSON.stringify({ quantity, productId }),
      contentType: "application/json",

      success: function (response) {
        const sum = +response.data;
        //update cart
        $("#sumCart").text(sum);
        //show message
        $.toast({
          heading: "Giỏ hàng",
          text: "Thêm sản phẩm vào giỏ hàng thành công",
          position: "top-right",
          icon: "success",
        });
      },
      error: function (response) {
        $.toast({
          heading: "Có lỗi xảy ra",
          text: "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.",
          position: "top-right",
          icon: "error",
        });
        console.log("error: ", response);
      },
    });
  });

  function isLogin() {
    const navElement = $("#navbarCollapse");
    const childLogin = navElement.find("a.a-login");
    if (childLogin.length > 0) {
      return false;
    }
    return true;
  }
})(jQuery);
