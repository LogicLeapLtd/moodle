define(['jquery'], function($) {
  return {
    init: function() {
      // Filter functionality
      $('.btn-filter').click(function() {
        $('.btn-filter').removeClass('active');
        $(this).addClass('active');
        const filter = $(this).data('filter');
        
        if (filter === 'all') {
          $('.course-card').show();
        } else {
          $('.course-card').hide();
          $(`.course-card[data-course-status="${filter}"]`).show();
        }
      });

      // Course card hover effects
      $('.course-card').hover(
        function() { $(this).addClass('hover'); },
        function() { $(this).removeClass('hover'); }
      );
    }
  };
}); 