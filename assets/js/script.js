(function ($) {
  "use strict";

  // Sticky Menu
  $(window).scroll(function () {
    if ($(".navigation").offset().top > 100) {
      $(".navigation").addClass("nav-bg");
    } else {
      $(".navigation").removeClass("nav-bg");
    }
  });

  // Background-images
  $("[data-background]").each(function () {
    $(this).css({
      "background-image": "url(" + $(this).data("background") + ")",
    });
  });

  // background color
  $("[data-color]").each(function () {
    $(this).css({
      "background-color": $(this).data("color"),
    });
  });

  // progress bar
  $("[data-progress]").each(function () {
    $(this).css({
      bottom: $(this).data("progress"),
    });
  });

  /* ########################################### Terminal Typing Effect ############################################## */
  function typeCommand() {
    const terminalBody = document.getElementById("terminal-body");
    const commandText = terminalBody ? terminalBody.getAttribute("data-command") : "joseph --status 'coding'";
    const commandElement = document.getElementById("typed-command");
    const outputElement = document.getElementById("terminal-output");
    
    if (!commandElement) return;

    let i = 0;
    commandElement.classList.add("typing");
    
    function type() {
      if (i < commandText.length) {
        commandElement.textContent += commandText.charAt(i);
        i++;
        setTimeout(type, 50 + Math.random() * 50);
      } else {
        commandElement.classList.remove("typing");
        setTimeout(() => {
          if (outputElement) {
            outputElement.style.display = "block";
            outputElement.style.opacity = 0;
            let opacity = 0;
            const fadeIn = setInterval(() => {
              if (opacity >= 1) clearInterval(fadeIn);
              outputElement.style.opacity = opacity;
              opacity += 0.1;
            }, 50);
          }
        }, 500);
      }
    }
    
    setTimeout(type, 1000);
  }

  $(document).ready(function() {
    typeCommand();
    
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });

    // Magnetic Button Effect
    $('.btn').on('mousemove', function(e) {
      const btn = $(this);
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.css('transform', `translate(${x * 0.3}px, ${y * 0.3}px)`);
    });

    $('.btn').on('mouseleave', function() {
      $(this).css('transform', 'translate(0, 0)');
    });

    // Dark Mode Toggle Logic
    const htmlElement = document.documentElement;
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const dockDarkModeToggle = document.getElementById('dock-dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    const dockDarkModeIcon = dockDarkModeToggle ? dockDarkModeToggle.querySelector('i') : null;

    const getStoredTheme = () => localStorage.getItem('theme');
    const setStoredTheme = theme => localStorage.setItem('theme', theme);

    const getPreferredTheme = () => {
      const storedTheme = getStoredTheme();
      if (storedTheme) {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const setTheme = theme => {
      htmlElement.setAttribute('data-bs-theme', theme);
      if (theme === 'dark') {
        if (darkModeIcon) {
          darkModeIcon.classList.replace('ti-shine', 'ti-light-bulb');
          darkModeIcon.classList.add('text-warning');
        }
        if (dockDarkModeIcon) {
          dockDarkModeIcon.classList.replace('ti-shine', 'ti-light-bulb');
          dockDarkModeIcon.classList.add('text-warning');
        }
      } else {
        if (darkModeIcon) {
          darkModeIcon.classList.replace('ti-light-bulb', 'ti-shine');
          darkModeIcon.classList.remove('text-warning');
        }
        if (dockDarkModeIcon) {
          dockDarkModeIcon.classList.replace('ti-light-bulb', 'ti-shine');
          dockDarkModeIcon.classList.remove('text-warning');
        }
      }
    };

    // Initialize theme
    setTheme(getPreferredTheme());

    const toggleTheme = () => {
      const currentTheme = htmlElement.getAttribute('data-bs-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      setStoredTheme(newTheme);
    };

    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', toggleTheme);
    }
    if (dockDarkModeToggle) {
      dockDarkModeToggle.addEventListener('click', toggleTheme);
    }

    // Initialize Tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
  });
  /* ########################################### /Terminal Typing Effect ############################################## */

  // testimonial-slider
  $(".testimonial-slider").slick({
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    arrows: false,
    adaptiveHeight: true,
  });

  // clients logo slider
  $(".client-logo-slider").slick({
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    dots: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 400,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });

  // Shuffle js filter and masonry
  var Shuffle = window.Shuffle;
  var jQuery = window.jQuery;

  var myShuffle = new Shuffle(document.querySelector(".shuffle-wrapper"), {
    itemSelector: ".shuffle-item",
    buffer: 1,
  });

  jQuery('input[name="shuffle-filter"]').on("change", function (evt) {
    var input = evt.currentTarget;
    if (input.checked) {
      myShuffle.filter(input.value);
      // Update active class on labels
      jQuery('.btn-filter').removeClass('active');
      jQuery(input).closest('.btn-filter').addClass('active');
    }
  });

})(jQuery);
