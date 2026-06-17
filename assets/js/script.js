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

    /* ########################################### Blog Post Improvements ############################################## */
    // Only run if on a blog post page (i.e. if .content exists and we are in a post layout)
    if ($('.content').length > 0 && $('#toc').length > 0) {
      
      // 1. Scroll Progress Bar & Back to Top
      $(window).on('scroll', function() {
        const scrollTop = $(window).scrollTop();
        const docHeight = $(document).height();
        const winHeight = $(window).height();
        const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
        $('#scroll-progress').css('width', scrollPercent + '%');
        
        // Show/hide back to top button
        if (scrollTop > 500) {
          $('#back-to-top').fadeIn(300);
        } else {
          $('#back-to-top').fadeOut(300);
        }
      });
      
      // Back to top action
      $('#back-to-top').on('click', function() {
        $('html, body').animate({ scrollTop: 0 }, 'smooth');
      });

      // 2. Dynamic Table of Contents (TOC)
      const tocList = $('.toc-list');
      const headers = $('.content').find('h2, h3');
      
      if (headers.length === 0) {
        $('.toc-card').hide(); // Hide TOC card if no headers
      } else {
        headers.each(function(index) {
          const header = $(this);
          let headerId = header.attr('id');
          
          // Ensure header has a unique ID
          if (!headerId) {
            headerId = 'toc-header-' + index;
            header.attr('id', headerId);
          }
          
          const headerText = header.text().replace(/#$/, '').trim(); // Remove anchors if any
          const isH3 = header.prop('tagName').toLowerCase() === 'h3';
          const indentClass = isH3 ? 'ps-3 toc-h3' : 'fw-semibold toc-h2';
          const marginTopClass = isH3 ? 'mt-1' : 'mt-2';
          
          const tocItem = $('<li class="' + marginTopClass + '"><a href="#' + headerId + '" class="toc-link text-decoration-none ' + indentClass + '">' + headerText + '</a></li>');
          tocList.append(tocItem);
        });

        // Highlight TOC active item on scroll
        const tocLinks = $('.toc-link');
        $(window).on('scroll', function() {
          const scrollPos = $(window).scrollTop() + 150; // Offset for sticky navbar
          
          headers.each(function() {
            const currHeader = $(this);
            const top = currHeader.offset().top;
            const bottom = top + currHeader.outerHeight();
            
            if (scrollPos >= top && scrollPos <= bottom) {
              tocLinks.removeClass('active');
              $('.toc-link[href="#' + currHeader.attr('id') + '"]').addClass('active');
            }
          });
        });
      }

      // 3. Style Callouts/Alert boxes inside blockquotes
      $('.content blockquote').each(function() {
        const blockquote = $(this);
        const text = blockquote.html();
        
        let type = '';
        let cleanText = text;
        
        // Match markdown-style [!NOTE] or strong tags
        if (text.includes('[!NOTE]') || text.includes('<strong>Note:</strong>')) {
          type = 'note';
          cleanText = text.replace('[!NOTE]', '').replace('<strong>Note:</strong>', '');
        } else if (text.includes('[!TIP]') || text.includes('<strong>Astuce:</strong>') || text.includes('<strong>Tip:</strong>')) {
          type = 'tip';
          cleanText = text.replace('[!TIP]', '').replace('<strong>Astuce:</strong>', '').replace('<strong>Tip:</strong>', '');
        } else if (text.includes('[!WARNING]') || text.includes('<strong>Attention:</strong>') || text.includes('<strong>Warning:</strong>')) {
          type = 'warning';
          cleanText = text.replace('[!WARNING]', '').replace('<strong>Attention:</strong>', '').replace('<strong>Warning:</strong>', '');
        } else if (text.includes('[!IMPORTANT]') || text.includes('[!CAUTION]') || text.includes('<strong>Important:</strong>')) {
          type = 'danger';
          cleanText = text.replace('[!IMPORTANT]', '').replace('[!CAUTION]', '').replace('<strong>Important:</strong>', '');
        }
        
        if (type) {
          blockquote.addClass('callout callout-' + type);
          let icon = 'ti-info-alt';
          let title = 'Note';
          
          if (type === 'tip') { icon = 'ti-light-bulb'; title = 'Tip'; }
          else if (type === 'warning') { icon = 'ti-alert'; title = 'Warning'; }
          else if (type === 'danger') { icon = 'ti-hand'; title = 'Important'; }
          
          // Support French translations for titles
          const isFrench = $('html').attr('lang') === 'fr';
          if (isFrench) {
            if (type === 'note') title = 'Remarque';
            else if (type === 'tip') title = 'Astuce';
            else if (type === 'warning') title = 'Attention';
            else if (type === 'danger') title = 'Important';
          }
          
          blockquote.html(
            '<div class="callout-header d-flex align-items-center gap-2 mb-2">' +
              '<i class="' + icon + ' text-' + (type === 'danger' ? 'danger' : (type === 'warning' ? 'warning' : (type === 'tip' ? 'success' : 'primary'))) + '"></i>' +
              '<span class="font-monospace callout-title-text fw-bold small text-uppercase">' + title + '</span>' +
            '</div>' +
            '<div class="callout-body">' + cleanText + '</div>'
          );
        }
      });

      // 4. Style Code Blocks (Window header, dots, language and copy action)
      $('.content div.highlighter-rouge').each(function(index) {
        const container = $(this);
        
        let lang = 'CODE';
        const classes = container.attr('class').split(' ');
        for (let i = 0; i < classes.length; i++) {
          if (classes[i].startsWith('language-')) {
            lang = classes[i].replace('language-', '').toUpperCase();
            break;
          }
        }
        
        const pre = container.find('pre');
        const code = container.find('code');
        const codeId = 'code-block-' + index;
        code.attr('id', codeId);
        
        const headerHtml = 
          '<div class="code-block-header d-flex justify-content-between align-items-center px-3 py-2 font-monospace small">' +
            '<div class="code-window-dots d-flex align-items-center">' +
              '<span class="dot red"></span>' +
              '<span class="dot yellow"></span>' +
              '<span class="dot green"></span>' +
            '</div>' +
            '<div class="d-flex align-items-center gap-3">' +
              '<span class="code-lang">' + lang + '</span>' +
              '<button class="copy-code-btn d-inline-flex align-items-center gap-1 text-secondary border-0 bg-transparent" data-code-target="#' + codeId + '">' +
                '<i class="ti-files"></i>' +
                '<span class="copy-text">Copy</span>' +
              '</button>' +
            '</div>' +
          '</div>';
        
        container.prepend(headerHtml);
      });
      
      // Copy action
      $('.copy-code-btn').on('click', function() {
        const btn = $(this);
        const targetSelector = btn.attr('data-code-target');
        const codeText = $(targetSelector).text();
        
        navigator.clipboard.writeText(codeText).then(function() {
          const textSpan = btn.find('.copy-text');
          const icon = btn.find('i');
          
          textSpan.text('Copied!');
          icon.attr('class', 'ti-check text-success');
          btn.addClass('text-success');
          
          setTimeout(function() {
            textSpan.text('Copy');
            icon.attr('class', 'ti-files');
            btn.removeClass('text-success');
          }, 2000);
        }, function(err) {
          console.error('Could not copy code: ', err);
        });
      });

      // Page link copy
      $('#copy-page-link').on('click', function() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
          const tooltip = bootstrap.Tooltip.getInstance(this);
          if (tooltip) {
            tooltip.setContent({ '.tooltip-inner': 'Copied !' });
            tooltip.show();
            setTimeout(() => {
              tooltip.hide();
              tooltip.setContent({ '.tooltip-inner': 'Copy link' });
            }, 2000);
          }
        });
      });

      // 5. Add Hover Anchors to Headers
      $('.content h2, .content h3').each(function() {
        const heading = $(this);
        const id = heading.attr('id');
        if (id) {
          heading.addClass('heading-anchor-wrapper');
          heading.append(
            '<a href="#' + id + '" class="heading-anchor text-secondary text-decoration-none transition-all">' +
              '<i class="ti-link"></i>' +
            '</a>'
          );
        }
      });
    }
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
